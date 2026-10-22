<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Site content lives in `src/site/`: all copy in `i18n.ts` dictionaries (fr/ar typed against en so nothing is missing), product/contact facts in `config.ts`. Why: one source of truth for three languages.
- Each language is a thin route (`/`, `/fr/`, `/ar/`) rendering the shared `Site` component; `__root` derives `lang`/`dir` from the pathname. Why: static-friendly, SSR-correct RTL.
- Product media are real captures from the product websites, hosted as Lovable assets; never fabricate screens.
