const files = import.meta.glob("./illustrations/*.{png,svg}", {
  eager: true,
  import: "default",
});

export const images = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split("/").pop().replace(/\.(png|svg)$/, ""),
    url,
  ])
);