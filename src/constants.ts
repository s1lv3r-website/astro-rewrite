import Github from "./components/icons/Github.astro";
import Link from "./components/icons/Link.astro";
import AtSign from "./components/icons/AtSign.astro";
import Discord from "./components/icons/Discord.astro";
import Matrix from "./components/icons/Matrix.astro";
import Signal from "./components/icons/Signal.astro";

export type AstroComponent = (_props: Record<string, any>) => any;

export const SITE_NAME: string = "S1LV3R";
export const TAGLINE: string =
  "Autistic trans woman (she/her), working with DevOps and systems design, engineering, and administration.";
export const THEME_COLOR: string = "#744eb4"

export const HIRE_ME_ENABLED: boolean = true;

export const MISC_LINKS: {
  icon: AstroComponent;
  title: string;
  link: string;
  description: string;
  rel?: string;
}[] = [
  {
    icon: Link,
    title: "Pronouns",
    link: "https://en.pronouns.page/@theS1LV3R",
    description: "A small page overviewing my pronouns and preferred terms",
    rel: "me",
  },
  {
    icon: Github,
    title: "dotfiles",
    link: "https://github.com/theS1LV3R/dotfiles",
    description: "All my dotfiles. There are a lot.",
  },
  // {
  //   icon: Link,
  //   title: "nerd",
  //   link: "https://nerd.s1lv3r.codes",
  //   description: "nerd",
  // },
  // {
  //   icon: Link,
  //   title: "Team Corax",
  //   link: "https://corax.team",
  //   description: "The CTF team I'm a member of",
  // },
  {
    icon: Link,
    title: "A Cypherpunk's Manifesto",
    link: "/cypherpunk.txt",
    description: '"A Cypherpunk\'s Manifesto" by Eric Hughes',
  },
];

export const CONTACT_LINKS: {
  title: string;
  link: string;
  icon: AstroComponent;
}[] = [
  {
    title: "GitHub [theS1LV3R]",
    link: "https://github.com/theS1LV3R",
    icon: Github,
  },
  {
    title: "Matrix [@s1lv3r:matrix.org]",
    link: "https://matrix.to/#/@s1lv3r:matrix.org",
    icon: Matrix,
  },
  {
    title: "Signal [hwx2l1wncm.54]",
    link: "https://signal.me/#eu/uQnZe59M88FcFd2TTXyvtA03IppAUx3e-WyhlSN3Gxlnf2AFxKpLQ7AM1n-nP7-x",
    icon: Signal,
  },
  {
    title: "Discord [theS1LV3R]",
    link: "https://discord.com/users/279692618391093248",
    icon: Discord,
  },
  {
    title: "Email: [me <at> s1lv3r <dot> codes]",
    link: "mailto:",
    icon: AtSign,
  },
];
