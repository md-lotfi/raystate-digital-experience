import { createFileRoute } from "@tanstack/react-router";
import { Site } from "@/site/Site";
import { pageHead } from "@/site/seo";

export const Route = createFileRoute("/fr/")({
  head: () => pageHead("fr"),
  component: () => <Site lang="fr" />,
});
