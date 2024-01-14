# MonoJustifier

There are many justification algorithms and engines out there, but this one is specifically for the mono width environment like terminal emulators and text editors. One use of this is for a comment justification extension on vscode or in the TextGraphic framework.

I have made this algorithm after years of needing something specifically for monospace environments that is tailored with care to make text look nice there. No algorithm is designed for this purpose and those that do are so basic. I have created a new system that is fast, and very powerful, supporting many important features that were previously non-existent:

- Last Line Orphan Word Handler
- Specialized Mono Width Typographical River Elimination
- Specialized Mono Width Space Balancer
- Word Breaker for Long Words With Controllable Tolerance Factor

```ts
import { MonoJustifier } from '@kary/justifier';
const justifier = new MonoJustifier(40);

const justifiedLines = justifier.justify([
    'Mono Justifier is a text justification engine specially',
    'designed for the mono space environments like terminal',
    'and text editors.'
]);
```