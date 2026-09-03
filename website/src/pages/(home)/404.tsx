import { DefaultNotFound } from "fumadocs-ui/layouts/home/not-found";

export default DefaultNotFound;

export async function getConfig() {
  return {
    render: "static",
  } as const;
}
