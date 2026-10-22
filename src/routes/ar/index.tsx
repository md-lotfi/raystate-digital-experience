import { createFileRoute } from "@tanstack/react-router";
import { Site } from "@/site/Site";
import { pageHead } from "@/site/seo";

export const Route = createFileRoute("/ar/")({
  head: () => pageHead("ar"),
  component: () => <Site lang="ar" />,
});
