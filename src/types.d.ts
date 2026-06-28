export type EightyEightThirtyOneButton = {
  /** Link to image or file name */
  image: string;
  alt: string;
  target?: string;
};

export type Link = {
  icon: AstroComponent;
  title: string;
  link: string;
  description?: string;
  rel?: string;
}
