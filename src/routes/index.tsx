import { createFileRoute } from "@tanstack/react-router";
import { Site } from "@/site/Site";
import { pageHead } from "@/site/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("en"),
  component: () => <Site lang="en" />,
});
