---
title: Automatic LetsEncrypt certificates with Tailscale and Traefik in Docker
showInUI: true
pubDate: 2025-12-18T02:10:00.000+01:00
---
Recently (not really, 2022), Traefik released support for [obtaining LetsEncrypt certs for Tailscale hosts](https://traefik.io/blog/exploring-the-tailscale-traefik-proxy-integration). With this, Traefik gained the ability to automatically (if configured correctly) communicate with a locally running Tailscale daemon to request a certificate through the [Tailscale certificate cervices](https://tailscale.com/kb/1153/enabling-https) for the locally running machine.

Doing some research, this seemed to perfectly align with my goals, so I gave it a try. Reading up on documentation a bit, I figured it would be enough to just configure Traefik to be on the same network as Tailscale, so I tried the following:

```yaml
services:
  tailscale:
    # redacated for example
  traefik:
    network: service:tailscale
```

However, when trying this out I kept getting a strange error... Traefik was unable to communicate with the Tailscale daemon even though it was running on the same network!

Looking into the logs and source, I discovered that Traefik is trying to access Tailscale through the local socket on `/var/run/tailscale/tailscaled.sock`. This obviously isn't passed through through the above `network:` option, so I add some more:

```yaml
services:
  tailscale:
    volumes: [var_run_tailscale:/var/run/tailscale]
  traefik:
    volumes: [var_run_tailscale:/var/run/tailscale]

volumes:
  var_run_tailscale:
```

But, this also didn't work! At this point I got stumped for a solid while. It should've worked, no? Traefik has access to the Tailscale socket? But no! Digging into the containers themselves and checking the status of the socket, I see this:

```sh
❯ docker compose exec traefik sh
/ # stat /var/run/tailscale/tailscaled.sock
  File: '/var/run/tailscale/tailscaled.sock' -> '/tmp/tailscaled.sock'
#...
```

Aha! The socket, for whatever reason, is actually a symlink to `/tmp`?? This really confused me, as on my non-docker install of tailscale the socket is simply a regular socket.

So, more source code digging is required. Looking into the container, I see it starts a binary called `containerboot`. I checked the tailscale repo, and found the matching file: [`cmd/containerboot/tailscaled.go`](https://github.com/tailscale/tailscale/blob/b21cba0921dfd4c8ac9cf4fa7210879d0ea7cf34/cmd/containerboot/tailscaled.go) Nestled in there, on lines 78-82, there is the following:

```go
	case cfg.StateDir != "":
		args = append(args, "--statedir="+cfg.StateDir)
	default:
		args = append(args, "--state=mem:", "--statedir=/tmp")
	}
```

As well as [`cmd/containerboot/main.go`](https://github.com/tailscale/tailscale/blob/b21cba0921dfd4c8ac9cf4fa7210879d0ea7cf34/cmd/containerboot/main.go) containing:

```go
func configFromEnv() (*settings, error) {
	cfg := &settings{
    // ...
    Socket: defaultEnv("TS_SOCKET", "/tmp/tailscaled.sock"),
    // ...
  }
}
```

Now, why this was introduced I have NO idea, and instead of trying to mess
