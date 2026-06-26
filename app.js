
// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (!page) return;
  page.classList.add('active');
  document.querySelectorAll('.nav-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.page === id);
  });
  window.scrollTo(0, 0);

  // Re-render the dynamic banks when their page opens. This prevents raw LaTeX such as
  // $\\displaystyle\\int ...$ from appearing before KaTeX has processed the inserted HTML.
  if (id === 'game') initGame();
  if (id === 'module') initModuleBank();
  if (id === 'derivatives') initDerivativesBank();
  if (id === 'drv') initDRVBank();
  if (id === 'logs') initLogBank();
  if (id === 'crv') initCRVBank();
  if (id === 'ci') initCIBank();

  // Keep the user's selected subtopic when possible; otherwise the active/default block remains visible.
  setTimeout(() => rerenderMath(page), 0);
}

function selectTopic(topic) {
  document.querySelectorAll('.topic-content-block').forEach(b => b.classList.remove('active'));
  document.getElementById('topic-' + topic).classList.add('active');
  document.querySelectorAll('.topic-pill-card').forEach(c => c.classList.toggle('active', c.dataset.topic === topic));
  document.querySelectorAll('.sidebar-item[data-topic]').forEach(c => c.classList.toggle('active', c.dataset.topic === topic));
  renderTier(topic, 'easy');
  renderTier(topic, 'medium');
  renderTier(topic, 'hard');
  rerenderMath(document.getElementById('topic-' + topic));
}

function selectTier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('tier-' + topic + '-' + tier).classList.add('active');
}


// Escape raw < and > inside LaTeX fragments before inserting via innerHTML.
// Without this, strings such as $P(4<X<7)$ can be parsed by the browser as broken HTML tags.
function protectMathHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/(\$\$?)([\s\S]*?)(\1)/g, (match, open, inner, close) => {
    return open + inner.replace(/</g, '&lt;').replace(/>/g, '&gt;') + close;
  });
}

function rerenderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]
    });
  }
}

// ═══════════════════════════════════════════════════
// QUESTION BANK — organised by topic > tier > [questions]
// Each question: { q: "...", steps: [ {text, micro:{title,body}} ] }
// ═══════════════════════════════════════════════════
const QBANK = {
  power: {
    easy: [
      { q: "Find $\\displaystyle\\int 4x^3\\,dx$",
        steps: [
          { text: "Identify this as a single power term: $4x^3$.",
            micro: { title: "Spotting power terms", body: "Any term of the form $kx^n$ (a number times a power of $x$) is a power term. Here $k=4$, $n=3$." } },
          { text: "Apply the power rule: raise the index by 1, divide by the new index.<br>$\\int 4x^3\\,dx = 4 \\cdot \\dfrac{x^4}{4} + c$",
            micro: { title: "Power rule on a simpler example", body: "$\\int 5x^2\\,dx$: raise index $2 \\to 3$, divide by $3$.<br>$= 5 \\cdot \\dfrac{x^3}{3} + c = \\dfrac{5x^3}{3} + c$" } },
          { text: "Simplify: the 4's cancel.<br><strong>Answer:</strong> $x^4 + c$",
            micro: { title: "Why the coefficient often simplifies", body: "When the coefficient equals the original power (here $4$ matches the power $3{+}1=4$), it cancels exactly. This isn't always the case — always divide properly rather than assuming it cancels." } }
        ] },
      { q: "Find $\\displaystyle\\int (3x^2 - 2x + 5)\\,dx$",
        steps: [
          { text: "This is a sum of terms — integrate each one separately (linearity).",
            micro: { title: "Linearity of integration", body: "$\\int [f(x)+g(x)]\\,dx = \\int f(x)\\,dx + \\int g(x)\\,dx$. You can always split a sum into separate integrals and combine afterwards." } },
          { text: "$\\int 3x^2\\,dx = x^3$, &nbsp; $\\int -2x\\,dx = -x^2$, &nbsp; $\\int 5\\,dx = 5x$",
            micro: { title: "Integrating a constant", body: "A lone number like $5$ is really $5x^0$. Using the power rule: $\\int 5x^0\\,dx = 5 \\cdot \\dfrac{x^1}{1} = 5x$. This is why constants integrate to (constant)$\\times x$." } },
          { text: "Combine all terms and add one overall constant $c$.<br><strong>Answer:</strong> $x^3 - x^2 + 5x + c$",
            micro: { title: "Only one +c needed", body: "Even though we integrated three terms, we only add a single $+c$ at the very end — not one per term — because the constants would just combine into one unknown constant anyway." } }
        ] },
    ],
    medium: [
      { q: "Find $\\displaystyle\\int \\dfrac{3x^4 + x}{\\sqrt{x}}\\,dx$",
        steps: [
          { text: "Rewrite the fraction as separate powers of $x$ before integrating. $\\sqrt{x} = x^{1/2}$.",
            micro: { title: "Splitting a fraction over a root", body: "$\\dfrac{a+b}{c} = \\dfrac{a}{c}+\\dfrac{b}{c}$. So $\\dfrac{3x^4+x}{x^{1/2}} = 3x^4 \\cdot x^{-1/2} + x \\cdot x^{-1/2} = 3x^{7/2} + x^{1/2}$." } },
          { text: "Now integrate each power term: $\\int 3x^{7/2}\\,dx = 3 \\cdot \\dfrac{x^{9/2}}{9/2} = \\dfrac{2x^{9/2}}{3}$, and $\\int x^{1/2}\\,dx = \\dfrac{2x^{3/2}}{3}$",
            micro: { title: "Dividing by a fraction index", body: "Dividing by $\\frac{9}{2}$ is the same as multiplying by $\\frac{2}{9}$. So $3 \\div \\frac{9}{2} = 3 \\times \\frac{2}{9} = \\frac{2}{3}$." } },
          { text: "Combine: <strong>Answer:</strong> $\\dfrac{2x^{9/2}}{3} + \\dfrac{2x^{3/2}}{3} + c$",
            micro: null }
        ] },
      { q: "Given $f'(x) = 6x^2 - 4x$ and $f(1) = 3$, find $f(x)$.",
        steps: [
          { text: "Integrate $f'(x)$ to get the general form of $f(x)$, including $+c$.<br>$f(x) = 2x^3 - 2x^2 + c$",
            micro: { title: "Why we need +c here", body: "Many functions share the same derivative — they only differ by a vertical shift. The condition $f(1)=3$ will pin down exactly which one we want." } },
          { text: "Substitute the given point $f(1) = 3$ to solve for $c$.<br>$2(1)^3 - 2(1)^2 + c = 3 \\Rightarrow 2 - 2 + c = 3 \\Rightarrow c = 3$",
            micro: { title: "Using an initial condition", body: "If $g(x) = x^2 + c$ and we're told $g(2) = 9$: substitute $x=2$: $4 + c = 9$, so $c = 5$. Same idea — plug the known point into your general antiderivative." } },
          { text: "<strong>Answer:</strong> $f(x) = 2x^3 - 2x^2 + 3$", micro: null }
        ] },
    ],
    hard: [
      { q: "The curve $y=f(x)$ has $f''(x)=12x-12$ and a horizontal point of inflection at $(1,4)$. Find $f(x)$.",
        steps: [
          { text: "Integrate the second derivative to find the first derivative:<br>$f'(x)=\\displaystyle\\int(12x-12)\\,dx=6x^2-12x+c_1$.",
            micro: { title: "Why integrate twice?", body: "You are given $f''(x)$, so one integration moves back to $f'(x)$ and a second integration moves back to $f(x)$. Each integration introduces a new constant." } },
          { text: "Because the point of inflection is horizontal, $f'(1)=0$. Substitute $x=1$:<br>$6(1)^2-12(1)+c_1=0 \\Rightarrow -6+c_1=0 \\Rightarrow c_1=6$.",
            micro: { title: "Using the word horizontal", body: "A point of inflection only tells you concavity changes. The word <em>horizontal</em> adds that the tangent gradient is zero, so $f'(1)=0$." } },
          { text: "So $f'(x)=6x^2-12x+6$. Integrate again:<br>$f(x)=2x^3-6x^2+6x+c_2$.",
            micro: { title: "Second constant", body: "The first constant was found from the gradient condition. The second constant is found using the point on the curve." } },
          { text: "Use $(1,4)$: $f(1)=4$.<br>$2-6+6+c_2=4 \\Rightarrow 2+c_2=4 \\Rightarrow c_2=2$.",
            micro: { title: "Point on the curve", body: "A point $(a,b)$ on $y=f(x)$ means $f(a)=b$. Here, substitute $x=1$ and set the expression equal to $4$." } },
          { text: "<strong>Answer:</strong> $f(x)=2x^3-6x^2+6x+2$.",
            micro: { title: "Check consistency", body: "$f''(1)=12(1)-12=0$, and $12x-12$ changes sign at $x=1$, so the inflection condition is consistent." } }
        ] },
    ]
  },

  trigexp: {
    easy: [
      { q: "Find $\\displaystyle\\int e^{2x}\\,dx$",
        steps: [
          { text: "Recognise the standard exponential form with a linear inner function $2x$.",
            micro: { title: "Standard exponential rule", body: "$\\int e^x\\,dx = e^x + c$. When the power is $kx$ instead of just $x$, you'll need to divide by $k$ in the next step." } },
          { text: "Integrate then divide by the inner derivative ($\\frac{d}{dx}(2x) = 2$): $\\int e^{2x}\\,dx = \\dfrac{e^{2x}}{2} + c$",
            micro: { title: "Quick check by differentiating back", body: "Differentiate $\\frac{e^{2x}}{2}$: chain rule gives $\\frac{1}{2} \\times 2e^{2x} = e^{2x}$. ✓ It matches the original function, confirming our integral is correct." } }
        ] },
      { q: "Find $\\displaystyle\\int \\sin(3x)\\,dx$",
        steps: [
          { text: "Recall $\\int \\sin x\\,dx = -\\cos x + c$ (note the negative sign).",
            micro: { title: "Why sin integrates to −cos", body: "Differentiating $-\\cos x$ gives $+\\sin x$ (since $\\frac{d}{dx}\\cos x = -\\sin x$, the negatives cancel). So $\\int \\sin x\\,dx = -\\cos x + c$." } },
          { text: "Divide by the inner derivative (3): $\\int \\sin(3x)\\,dx = -\\dfrac{\\cos(3x)}{3} + c$", micro: null }
        ] },
    ],
    medium: [
      { q: "Find $\\displaystyle\\int (2e^{3x} + \\cos(4x))\\,dx$",
        steps: [
          { text: "Split into two separate integrals using linearity.", micro: null },
          { text: "$\\int 2e^{3x}\\,dx = \\dfrac{2e^{3x}}{3}$ — integrate then divide by inner derivative 3.",
            micro: { title: "Coefficient stays out front", body: "$\\int k \\cdot e^{ax}\\,dx = \\dfrac{k}{a}e^{ax}+c$. Here $k=2$, $a=3$, giving $\\frac{2}{3}e^{3x}$." } },
          { text: "$\\int \\cos(4x)\\,dx = \\dfrac{\\sin(4x)}{4}$ — integrate then divide by inner derivative 4.<br><strong>Answer:</strong> $\\dfrac{2e^{3x}}{3} + \\dfrac{\\sin(4x)}{4} + c$", micro: null }
        ] },
      { q: "Find the gradient function's antiderivative: given $f'(x) = e^{-x} + \\sin(2x)$, find $f(x)$, given $f(0) = 1$.",
        steps: [
          { text: "Integrate term by term: $\\int e^{-x}\\,dx = \\dfrac{e^{-x}}{-1} = -e^{-x}$ (inner derivative of $-x$ is $-1$).",
            micro: { title: "Negative inner derivative", body: "$\\int e^{-x}\\,dx$: inner function is $-x$, inner derivative is $-1$. Dividing by $-1$ flips the sign: $\\frac{e^{-x}}{-1} = -e^{-x}$." } },
          { text: "$\\int \\sin(2x)\\,dx = -\\dfrac{\\cos(2x)}{2}$", micro: null },
          { text: "Combine: $f(x) = -e^{-x} - \\dfrac{\\cos(2x)}{2} + c$. Substitute $f(0)=1$: $-1 - \\dfrac{1}{2} + c = 1 \\Rightarrow c = \\dfrac{5}{2}$<br><strong>Answer:</strong> $f(x) = -e^{-x} - \\dfrac{\\cos(2x)}{2} + \\dfrac{5}{2}$",
            micro: { title: "Evaluating at x=0", body: "$e^{-0}=1$ and $\\cos(0)=1$ — remember these standard values when substituting $x=0$ into trig/exponential expressions." } }
        ] },
    ],
    hard: [
      { q: "(a) Show that $\\dfrac{d}{dx}(xe^x)=e^x(x+1)$.<br>(b) Hence evaluate $\\displaystyle\\int_0^1 xe^x\\,dx$.",
        steps: [
          { text: "For part (a), identify a product: $u=x$ and $v=e^x$.",
            micro: { title: "Why product rule?", body: "$xe^x$ is the product of two functions of $x$. The derivative is not found by differentiating each part separately and multiplying; use $u'v+uv'$." } },
          { text: "Differentiate each factor: $u'=1$ and $v'=e^x$.",
            micro: { title: "Derivative of $e^x$", body: "$e^x$ is special because its derivative is itself: $\\dfrac{d}{dx}(e^x)=e^x$." } },
          { text: "Apply product rule:<br>$\\dfrac{d}{dx}(xe^x)=1\\cdot e^x+x\\cdot e^x=e^x(1+x)$.",
            micro: { title: "Factor the result", body: "Both terms contain $e^x$, so $e^x+xe^x=e^x(1+x)$. This factorised form is exactly what part (b) uses." } },
          { text: "Rearrange the derivative result to isolate $xe^x$:<br>$xe^x=\\dfrac{d}{dx}(xe^x)-e^x$.",
            micro: { title: "The hence move", body: "A hence question usually wants you to reuse the previous derivative. Rearrange the derivative so the integrand you want appears by itself." } },
          { text: "Integrate both sides from $0$ to $1$:<br>$\\displaystyle\\int_0^1 xe^x\\,dx=\\Big[xe^x\\Big]_0^1-\\displaystyle\\int_0^1e^x\\,dx$.",
            micro: { title: "Derivative becomes a bracket", body: "Integrating $\\dfrac{d}{dx}(xe^x)$ from $0$ to $1$ gives $[xe^x]_0^1$ by the Fundamental Theorem of Calculus." } },
          { text: "Evaluate:<br>$[xe^x]_0^1=e$, and $\\displaystyle\\int_0^1e^x\\,dx=[e^x]_0^1=e-1$.<br><strong>Answer:</strong> $e-(e-1)=1$.",
            micro: { title: "Careful lower limits", body: "At $x=0$, $xe^x=0\\cdot e^0=0$, but $e^0=1$ in the second bracket. Keep the two evaluations separate." } }
        ] },
    ]
  },

  chain: {
    easy: [
      { q: "Find $\\displaystyle\\int (4x-1)^3\\,dx$",
        steps: [
          { text: "Treat $(4x-1)$ as a single 'block'. Integrate as if it were $x^3$, then divide by the inner derivative.",
            micro: { title: "Identifying inner & outer", body: "Outer: $(\\square)^3 \\to$ power rule. Inner: $4x-1 \\to$ derivative is $4$." } },
          { text: "$\\int (4x-1)^3\\,dx = \\dfrac{(4x-1)^4}{4} \\div 4 = \\dfrac{(4x-1)^4}{16} + c$",
            micro: { title: "Two divisions happening", body: "First divide by the new power (4) from the power rule itself, then divide again by the inner derivative (4). Both divisions are needed: $\\frac{1}{4} \\times \\frac{1}{4} = \\frac{1}{16}$." } }
        ] },
    ],
    medium: [
      { q: "Find $\\displaystyle\\int \\dfrac{1}{(2x+5)^2}\\,dx$",
        steps: [
          { text: "Rewrite using a negative index: $\\dfrac{1}{(2x+5)^2} = (2x+5)^{-2}$.", micro: null },
          { text: "Apply power rule to the bracket, then divide by inner derivative (2): $\\int (2x+5)^{-2}\\,dx = \\dfrac{(2x+5)^{-1}}{-1} \\div 2 = -\\dfrac{1}{2(2x+5)} + c$",
            micro: { title: "Negative index power rule", body: "$\\int x^{-2}\\,dx = \\dfrac{x^{-1}}{-1} = -x^{-1} = -\\dfrac{1}{x}$. The same pattern applies with the bracket in place of $x$." } }
        ] },
      { q: "Find $\\displaystyle\\int 6x(x^2+1)^2\\,dx$ by recognising the composite structure (not full expansion).",
        steps: [
          { text: "Notice $\\frac{d}{dx}(x^2+1) = 2x$, and we have a $6x$ out front — a multiple of this inner derivative. This signals a reverse-chain shortcut.",
            micro: { title: "Spotting reverse chain in disguise", body: "If the integrand looks like (inner derivative) $\\times$ (function of the inner expression), you can integrate without full expansion — much faster than multiplying everything out." } },
          { text: "Write $6x = 3 \\times 2x$, so $\\int 6x(x^2+1)^2\\,dx = 3\\int 2x(x^2+1)^2\\,dx$. Treating $(x^2+1)$ as the block: $\\int 2x(x^2+1)^2\\,dx = \\dfrac{(x^2+1)^3}{3}$",
            micro: { title: "Why this shortcut works", body: "This is really the reverse of the chain rule applied to $(x^2+1)^3$: $\\frac{d}{dx}(x^2+1)^3 = 3(x^2+1)^2 \\cdot 2x = 6x(x^2+1)^2$ — exactly our integrand! So the antiderivative is $(x^2+1)^3$ (up to a constant)." } },
          { text: "Combine: $3 \\times \\dfrac{(x^2+1)^3}{3} = (x^2+1)^3$<br><strong>Answer:</strong> $(x^2+1)^3 + c$", micro: null }
        ] },
    ],
    hard: [
      { q: "Show that $\\displaystyle\\int 4x^2(x^3+4)^7\\,dx$ can be written as $\\dfrac{4}{3}\\displaystyle\\int 3x^2(x^3+4)^7\\,dx$, and hence integrate.",
        steps: [
          { text: "Identify the inner function: $x^3+4$. Its derivative is $3x^2$.",
            micro: { title: "Spot the inner derivative", body: "Reverse chain works when the integrand contains the derivative of the expression inside the brackets. Here the bracket is $x^3+4$, so we look for $3x^2$." } },
          { text: "The integrand has $4x^2$, not $3x^2$. Rewrite $4x^2$ as $\\dfrac43\\cdot3x^2$.",
            micro: { title: "Manufacturing the coefficient", body: "Multiplying by $\\frac43$ outside creates the exact $3x^2$ factor needed inside. The value is unchanged because $\\frac43\\cdot3x^2=4x^2$." } },
          { text: "So<br>$\\displaystyle\\int4x^2(x^3+4)^7\\,dx=\\dfrac43\\displaystyle\\int3x^2(x^3+4)^7\\,dx$.",
            micro: { title: "Pulling out constants", body: "Constants can move outside integrals: $\\int kf(x)\\,dx=k\\int f(x)\\,dx$." } },
          { text: "Now integrate the clean reverse-chain form:<br>$\\displaystyle\\int3x^2(x^3+4)^7\\,dx=\\dfrac{(x^3+4)^8}{8}$.",
            micro: { title: "Reverse-chain power rule", body: "Once the inner derivative is present, treat the bracket like one variable: raise $7$ to $8$, then divide by $8$." } },
          { text: "Multiply back by $\\dfrac43$:<br>$\\dfrac43\\cdot\\dfrac{(x^3+4)^8}{8}=\\dfrac{(x^3+4)^8}{6}$.<br><strong>Answer:</strong> $\\dfrac{(x^3+4)^8}{6}+c$.",
            micro: { title: "Check by differentiating", body: "Differentiating $\\dfrac{(x^3+4)^8}{6}$ gives $\\dfrac86(x^3+4)^7(3x^2)=4x^2(x^3+4)^7$, which matches the integrand." } }
        ] },
    ]
  },

  ftc: {
    easy: [
      { q: "Evaluate $\\displaystyle\\int_0^2 (x^2+1)\\,dx$",
        steps: [
          { text: "Find the antiderivative: $F(x) = \\dfrac{x^3}{3} + x$",
            micro: { title: "No +c needed for definite integrals", body: "When evaluating a definite integral, the $+c$ cancels out automatically: $[F(x)+c]_a^b = (F(b)+c)-(F(a)+c) = F(b)-F(a)$. So we skip writing $c$ for definite integrals." } },
          { text: "Apply the Fundamental Theorem: $F(2)-F(0)$.<br>$F(2) = \\dfrac{8}{3}+2 = \\dfrac{14}{3}$, &nbsp; $F(0)=0$",
            micro: null },
          { text: "<strong>Answer:</strong> $\\dfrac{14}{3} - 0 = \\dfrac{14}{3}$", micro: null }
        ] },
      { q: "Evaluate $\\displaystyle\\int_1^e \\dfrac{1}{x}\\,dx$",
        steps: [
          { text: "Recall the standard result $\\int \\dfrac{1}{x}\\,dx = \\ln|x| + c$.",
            micro: { title: "Why ln, not a power rule", body: "The power rule $\\int x^n dx = \\frac{x^{n+1}}{n+1}$ fails when $n=-1$ (division by zero). The natural log fills this gap: $\\frac{d}{dx}\\ln x = \\frac{1}{x}$." } },
          { text: "Evaluate: $[\\ln x]_1^e = \\ln e - \\ln 1 = 1 - 0 = 1$<br><strong>Answer:</strong> $1$",
            micro: { title: "Key log values", body: "$\\ln e = 1$ (since $e^1=e$) and $\\ln 1 = 0$ (since anything$^0=1$). These two values appear constantly in WACE log questions." } }
        ] },
    ],
    medium: [
      { q: "Find the total (unsigned) area between $y = x^2-4$ and the x-axis from $x=0$ to $x=3$.",
        steps: [
          { text: "First find where the curve crosses the x-axis within $[0,3]$: $x^2-4=0 \\Rightarrow x=\\pm 2$. Only $x=2$ is in range.",
            micro: { title: "Why we need the x-intercepts here", body: "Total area requires splitting at every sign change. If we integrated straight across $[0,3]$ without splitting, the negative region (below the axis) would subtract from the positive region, giving the wrong (signed) answer instead of total area." } },
          { text: "On $[0,2]$, $y<0$ (check: at $x=0$, $y=-4$). On $[2,3]$, $y>0$ (check: at $x=3$, $y=5$). Take the absolute value of the negative piece.",
            micro: null },
          { text: "Area $= \\left|\\displaystyle\\int_0^2 (x^2-4)\\,dx\\right| + \\displaystyle\\int_2^3 (x^2-4)\\,dx$<br>$= \\left|\\left[\\dfrac{x^3}{3}-4x\\right]_0^2\\right| + \\left[\\dfrac{x^3}{3}-4x\\right]_2^3$",
            micro: null },
          { text: "First: $\\left|\\dfrac{8}{3}-8\\right| = \\left|-\\dfrac{16}{3}\\right| = \\dfrac{16}{3}$. Second: $(9-12)-\\left(\\dfrac{8}{3}-8\\right) = -3+\\dfrac{16}{3} = \\dfrac{7}{3}$<br><strong>Total area:</strong> $\\dfrac{16}{3}+\\dfrac{7}{3} = \\dfrac{23}{3}$",
            micro: null }
        ] },
      { q: "A particle's velocity is $v(t) = 3t^2-12t$ m/s. Find the total distance travelled in the first 5 seconds.",
        steps: [
          { text: "Find when the particle changes direction: solve $v(t)=0$.<br>$3t^2-12t=0 \\Rightarrow 3t(t-4)=0 \\Rightarrow t=0,4$",
            micro: { title: "Why distance needs direction changes", body: "Distance is always positive — it doesn't care which way the particle moves. Displacement can cancel out (forward then back), but distance adds up every bit of motion. We must find every point where velocity changes sign." } },
          { text: "Check sign of $v(t)$ on $(0,4)$ and $(4,5)$: at $t=2$, $v=12-24=-12<0$ (moving backward). At $t=4.5$: $v=60.75-54=6.75>0$ (moving forward).",
            micro: null },
          { text: "Distance $= \\left|\\displaystyle\\int_0^4 v(t)\\,dt\\right| + \\displaystyle\\int_4^5 v(t)\\,dt$",
            micro: { title: "Setting up the split integral", body: "Antiderivative: $\\int v(t)\\,dt = t^3-6t^2$. Evaluate each piece between its own limits, then combine with absolute values where needed." } },
          { text: "First piece: $[t^3-6t^2]_0^4 = (64-96)-0=-32$, so $|-32|=32$.<br>Second piece: $[t^3-6t^2]_4^5 = (125-150)-(64-96)=-25-(-32)=7$<br><strong>Total distance:</strong> $32+7=39$ m",
            micro: null }
        ] },
    ],
    hard: [
      { q: "Let $G(x) = \\displaystyle\\int_1^x \\sqrt{t^2+1}\\,dt$. Find $G'(2)$ without evaluating the integral.",
        steps: [
          { text: "Recognise this needs the Fundamental Theorem of Calculus (the 'differentiating an integral' form), not direct integration.",
            micro: { title: "The two forms of FTC", body: "Form 1: $\\int_a^b f(x)dx = F(b)-F(a)$ (evaluates a number).<br>Form 2: $\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$ (gives back the original function — no integration needed at all)." } },
          { text: "By the theorem, $G'(x) = \\sqrt{x^2+1}$ directly — we never need to find an antiderivative of $\\sqrt{t^2+1}$ (which is hard).",
            micro: { title: "Why this shortcut is so powerful", body: "Some functions, like $\\sqrt{t^2+1}$, don't have elementary antiderivatives easy to write down. The FTC lets us bypass that entirely when we only need the derivative of the accumulated area function." } },
          { text: "Substitute $x=2$: $G'(2) = \\sqrt{4+1} = \\sqrt{5}$<br><strong>Answer:</strong> $\\sqrt{5}$", micro: null }
        ] },
      { q: "Given $\\frac{d}{dx}\\displaystyle\\int_\\pi^{f(x)} \\cos\\!\\left(\\frac{t}{3}\\right)dt$, find an expression for this derivative in terms of $f(x)$ and $f'(x)$.",
        steps: [
          { text: "This has a non-trivial upper limit $f(x)$ rather than just $x$ — we need the chain rule version of FTC.",
            micro: { title: "FTC with a function upper limit", body: "If $H(x) = \\int_a^{g(x)} h(t)\\,dt$, then $H'(x) = h(g(x)) \\cdot g'(x)$ — you substitute the upper limit into the integrand, then multiply by the derivative of that upper limit (chain rule)." } },
          { text: "Here $h(t) = \\cos(t/3)$ and the upper limit is $g(x)=f(x)$.",
            micro: null },
          { text: "Apply the rule: substitute $f(x)$ into the integrand, multiply by $f'(x)$.<br><strong>Answer:</strong> $\\cos\\!\\left(\\dfrac{f(x)}{3}\\right) \\cdot f'(x)$",
            micro: { title: "Sanity check with a concrete example", body: "If $f(x) = x^2$: $\\frac{d}{dx}\\int_\\pi^{x^2}\\cos(t/3)\\,dt = \\cos\\!\\left(\\frac{x^2}{3}\\right) \\cdot 2x$. Same pattern — substitute then multiply by the derivative of the limit." } }
        ] },
    ]
  },

  applications: {
    easy: [
      { q: "Find the area enclosed between $y=x$ and $y=x^2$ for $0 \\le x \\le 1$.",
        steps: [
          { text: "Confirm which curve is on top across this interval. At $x=0.5$: $y=x=0.5$, $y=x^2=0.25$. So $y=x$ is above $y=x^2$.",
            micro: { title: "Always test a point", body: "Don't guess which curve is on top — substitute any value strictly between the intersection points and compare the two y-values directly." } },
          { text: "Area $= \\displaystyle\\int_0^1 (x-x^2)\\,dx = \\left[\\dfrac{x^2}{2}-\\dfrac{x^3}{3}\\right]_0^1$",
            micro: null },
          { text: "$= \\left(\\dfrac{1}{2}-\\dfrac{1}{3}\\right)-0 = \\dfrac{1}{6}$<br><strong>Answer:</strong> $\\dfrac{1}{6}$", micro: null }
        ] },
    ],
    medium: [
      { q: "Find the area enclosed between $y=x^2$ and $y=2x+3$.",
        steps: [
          { text: "Find intersection points: $x^2 = 2x+3 \\Rightarrow x^2-2x-3=0 \\Rightarrow (x-3)(x+1)=0 \\Rightarrow x=-1,3$",
            micro: { title: "Setting curves equal", body: "Intersections occur where both functions give the same $y$-value for the same $x$ — so set the two expressions equal and solve like any other equation." } },
          { text: "Test which is on top, e.g. at $x=0$: line gives $3$, parabola gives $0$. Line is on top.",
            micro: null },
          { text: "Area $= \\displaystyle\\int_{-1}^{3} \\big[(2x+3)-x^2\\big]\\,dx = \\left[x^2+3x-\\dfrac{x^3}{3}\\right]_{-1}^{3}$",
            micro: null },
          { text: "At $x=3$: $9+9-9=9$. At $x=-1$: $1-3+\\dfrac{1}{3}=-\\dfrac{5}{3}$.<br>Area $= 9-\\left(-\\dfrac{5}{3}\\right) = \\dfrac{32}{3}$<br><strong>Answer:</strong> $\\dfrac{32}{3}$ square units",
            micro: null }
        ] },
      { q: "A particle starts at rest at the origin with acceleration $a(t) = 6t-4$ m/s². Find its position at $t=3$ s.",
        steps: [
          { text: "Integrate acceleration to get velocity: $v(t) = 3t^2-4t+c_1$. Since 'starts at rest', $v(0)=0 \\Rightarrow c_1=0$.",
            micro: { title: "Translating 'starts at rest'", body: "'At rest' means velocity is zero. 'Starts at the origin' means position is zero at $t=0$. Always translate these worded conditions into equations before integrating." } },
          { text: "Integrate velocity to get position: $x(t) = t^3-2t^2+c_2$. Since starts at origin, $x(0)=0 \\Rightarrow c_2=0$.",
            micro: null },
          { text: "Substitute $t=3$: $x(3) = 27-18 = 9$<br><strong>Answer:</strong> position is $9$ m from the origin", micro: null }
        ] },
    ],
    hard: [
      { q: "The line $y=x+1$ is tangent to $y=e^x$ at $x=0$. Find the area between $y=e^x$ and $y=x+1$ from $x=0$ to $x=1$, and show that it equals $e-\\dfrac52$.",
        steps: [
          { text: "Confirm the tangent relationship at $x=0$: $e^0=1$, so the curve passes through $(0,1)$, and $\\dfrac{d}{dx}e^x=e^x$, so the gradient there is $1$.",
            micro: { title: "Why $y=x+1$ is the tangent", body: "A line with gradient $1$ through $(0,1)$ is $y-1=1(x-0)$, which simplifies to $y=x+1$." } },
          { text: "Check which curve is on top on $(0,1)$. At $x=0.5$, $e^{0.5}\\approx1.65$ while $x+1=1.5$, so $e^x$ is above the tangent line.",
            micro: { title: "Top minus bottom", body: "Area between curves is found using $\\int(\\text{top}-\\text{bottom})\\,dx$. Testing one point avoids putting the functions in the wrong order." } },
          { text: "Set up the area integral:<br>$\\text{Area}=\\displaystyle\\int_0^1\\big(e^x-(x+1)\\big)\\,dx$.",
            micro: { title: "Why these limits?", body: "The question asks for the area from $x=0$ to $x=1$, so those are the lower and upper limits." } },
          { text: "Integrate:<br>$\\displaystyle\\int_0^1(e^x-x-1)\\,dx=\\left[e^x-\\dfrac{x^2}{2}-x\\right]_0^1$.",
            micro: { title: "Term-by-term integral", body: "$\\int e^x dx=e^x$, $\\int x dx=\\frac{x^2}{2}$, and $\\int1dx=x$. Keep the minus signs with the last two terms." } },
          { text: "Evaluate the bracket:<br>At $x=1$: $e-\\dfrac12-1=e-\\dfrac32$. At $x=0$: $1$.<br><strong>Area:</strong> $e-\\dfrac32-1=e-\\dfrac52$.",
            micro: { title: "Fraction arithmetic", body: "$-\\frac32-1=-\\frac32-\\frac22=-\\frac52$. The result is positive because $e\\approx2.718$, so $e-2.5\\approx0.218$." } }
        ] },
    ]
  }
};

function renderTier(topic, tier) {
  const container = document.getElementById('tier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (QBANK[topic] && QBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: '∫ Easy', medium: '∬ Medium', hard: '∭ Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];

  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;

  questions.forEach((qd, qi) => {
    const cardId = `${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header">
        <span class="q-number">Q${qi+1}</span>
        <div class="q-text">${protectMathHTML(qd.q)}</div>
      </div>
      <div class="q-actions">
        <button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button>
      </div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div>
        <div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span>
          <span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) {
        html += `<span class="exp-step-hint-tag">stuck?</span>`;
      }
      html += `<span class="exp-step-chevron">▶</span>
        </div>`;
      if (step.micro) {
        html += `<div class="exp-step-micro">
          <div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div>
          <div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div>
        </div>`;
      }
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

function toggleQAnswer(cardId) {
  const el = document.getElementById('ans-' + cardId);
  if (!el) return;
  const willShow = !el.classList.contains('visible');
  el.classList.toggle('visible', willShow);
  if (willShow) rerenderMath(el);
}

function toggleStep(stepId) {
  const el = document.getElementById('step-' + stepId);
  if (!el) return;
  const willOpen = !el.classList.contains('open');
  el.classList.toggle('open', willOpen);
  if (willOpen) rerenderMath(el);
}

// Initial render of default topic on load
function initModuleBank() {
  ['power','trigexp','chain','ftc','applications'].forEach(topic => {
    renderTier(topic, 'easy');
    renderTier(topic, 'medium');
    renderTier(topic, 'hard');
  });
}

// ═══════════════════════════════════════════════════
// DERIVATIVES PAGE — topic/tier navigation + question bank
// ═══════════════════════════════════════════════════
function selectDTopic(topic) {
  document.querySelectorAll('.dtopic-content-block').forEach(b => b.classList.remove('active'));
  document.getElementById('dtopic-' + topic).classList.add('active');
  document.querySelectorAll('.topic-pill-card[data-dtopic]').forEach(c => c.classList.toggle('active', c.dataset.dtopic === topic));
  document.querySelectorAll('.sidebar-item[data-dtopic]').forEach(c => c.classList.toggle('active', c.dataset.dtopic === topic));
  renderDTier(topic, 'easy');
  renderDTier(topic, 'medium');
  renderDTier(topic, 'hard');
  rerenderMath(document.getElementById('dtopic-' + topic));
}

function selectDTier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('dtier-' + topic + '-' + tier).classList.add('active');
}

const DBANK = {
  power: {
    easy: [
      { q: "Differentiate $f(x) = 5x^4$",
        steps: [
          { text: "Apply the power rule: multiply by the index, reduce the index by 1.",
            micro: { title: "Power rule pattern", body: "For $kx^n$: bring the index $n$ down as a multiplier, then the new index is $n-1$. So $kx^n \\to knx^{n-1}$." } },
          { text: "$f'(x) = 5 \\times 4 x^{4-1} = 20x^3$", micro: null }
        ] },
      { q: "Differentiate $f(x) = 7x^2 - 3x + 9$",
        steps: [
          { text: "Differentiate term by term (linearity).",
            micro: { title: "Linearity of differentiation", body: "$\\frac{d}{dx}[f(x)+g(x)] = f'(x)+g'(x)$. Each term can be handled separately and added back together." } },
          { text: "$\\frac{d}{dx}(7x^2) = 14x$, &nbsp; $\\frac{d}{dx}(-3x) = -3$, &nbsp; $\\frac{d}{dx}(9) = 0$",
            micro: { title: "Why constants vanish", body: "A constant like $9$ doesn't change as $x$ changes — its rate of change is always zero. Think of $9 = 9x^0$; differentiating gives $9 \\times 0 \\times x^{-1} = 0$." } },
          { text: "<strong>Answer:</strong> $f'(x) = 14x - 3$", micro: null }
        ] },
    ],
    medium: [
      { q: "Differentiate $f(x) = \\dfrac{1}{x^3} + 4\\sqrt{x}$",
        steps: [
          { text: "Rewrite using index notation before differentiating: $\\dfrac{1}{x^3} = x^{-3}$, &nbsp; $\\sqrt{x}=x^{1/2}$.",
            micro: { title: "Why rewriting first matters", body: "The power rule only applies directly to $x^n$ form. Roots and reciprocals must be converted to fractional/negative indices first, or you risk misapplying the rule." } },
          { text: "Differentiate each: $\\frac{d}{dx}(x^{-3}) = -3x^{-4}$, &nbsp; $\\frac{d}{dx}(4x^{1/2}) = 4 \\times \\frac{1}{2}x^{-1/2} = 2x^{-1/2}$",
            micro: { title: "Fractional index example", body: "$\\frac{d}{dx}(x^{1/2}) = \\frac{1}{2}x^{-1/2}$. Multiply by the index $\\frac12$, then subtract 1 from the index: $\\frac12 - 1 = -\\frac12$." } },
          { text: "<strong>Answer:</strong> $f'(x) = -3x^{-4} + 2x^{-1/2} = -\\dfrac{3}{x^4} + \\dfrac{2}{\\sqrt{x}}$", micro: null }
        ] },
      { q: "Find the gradient of $y = x^3 - 6x^2 + 9x$ at $x=1$.",
        steps: [
          { text: "Differentiate: $y' = 3x^2 - 12x + 9$",
            micro: null },
          { text: "Substitute $x=1$ into the derivative (not the original function — the gradient comes from $y'$).<br>$y'(1) = 3(1)-12(1)+9 = 3-12+9=0$",
            micro: { title: "Gradient vs function value", body: "A common mistake is substituting into $y$ instead of $y'$. The original function gives the height of the curve; the derivative gives the steepness (gradient) at that point." } },
          { text: "<strong>Answer:</strong> gradient $=0$ — this point is actually a stationary point!", micro: null }
        ] },
    ],
    hard: [
      { q: "The curve $y = ax^3+bx^2$ has gradient $4$ at $x=1$ and a stationary point at $x=2$. Find $a$ and $b$.",
        steps: [
          { text: "Differentiate: $y' = 3ax^2 + 2bx$",
            micro: null },
          { text: "Use the gradient condition at $x=1$: $y'(1) = 3a+2b = 4$ — equation ①",
            micro: { title: "Translating 'gradient at a point'", body: "'Gradient at $x=1$ is 4' always means $y'(1) = 4$. Substitute the x-value into the derivative, then set equal to the stated gradient." } },
          { text: "Use the stationary point condition at $x=2$: $y'(2) = 12a+4b = 0$ — equation ②",
            micro: { title: "Translating 'stationary point'", body: "A stationary point means $y'=0$ at that particular $x$-value. So substitute $x=2$ into $y'$ and set the whole expression to zero." } },
          { text: "Solve simultaneously. From ①: $2b = 4-3a \\Rightarrow b = 2-1.5a$. Substitute into ②: $12a+4(2-1.5a)=0 \\Rightarrow 12a+8-6a=0 \\Rightarrow 6a=-8 \\Rightarrow a=-\\dfrac{4}{3}$<br>Then $b = 2-1.5(-\\frac43) = 2+2 = 4$<br><strong>Answer:</strong> $a=-\\dfrac{4}{3}$, $b=4$",
            micro: { title: "Solving simultaneous equations by substitution", body: "Isolate one variable in the simpler-looking equation, substitute into the other, solve for the remaining variable, then back-substitute." } }
        ] },
    ]
  },

  trigexp: {
    easy: [
      { q: "Differentiate $f(x) = 3e^x + \\sin x$",
        steps: [
          { text: "Differentiate term by term using the standard results.",
            micro: { title: "Standard derivative recall", body: "$\\frac{d}{dx}(e^x)=e^x$ and $\\frac{d}{dx}(\\sin x) = \\cos x$ — these are given on the formula sheet but should be memorised for speed." } },
          { text: "<strong>Answer:</strong> $f'(x) = 3e^x + \\cos x$", micro: null }
        ] },
      { q: "Differentiate $f(x) = \\cos x - 2x^2$",
        steps: [
          { text: "Differentiate each term separately.", micro: null },
          { text: "$\\frac{d}{dx}(\\cos x) = -\\sin x$, &nbsp; $\\frac{d}{dx}(-2x^2) = -4x$<br><strong>Answer:</strong> $f'(x) = -\\sin x - 4x$",
            micro: { title: "Don't forget the negative on cos", body: "$\\cos x$ differentiates to $-\\sin x$ — the negative sign is easy to drop under exam pressure. Always double check this specific derivative." } }
        ] },
    ],
    medium: [
      { q: "Differentiate $f(x) = e^{3x} + 4\\cos x$, then find $f'(0)$.",
        steps: [
          { text: "Differentiate $e^{3x}$ using the chain rule shortcut: bring down the inner derivative (3).",
            micro: { title: "Exponential with linear inner function", body: "$\\frac{d}{dx}(e^{kx}) = ke^{kx}$. The constant $k$ from the exponent is multiplied out front." } },
          { text: "$f'(x) = 3e^{3x} - 4\\sin x$", micro: null },
          { text: "Substitute $x=0$: $f'(0) = 3e^0 - 4\\sin(0) = 3(1) - 4(0) = 3$<br><strong>Answer:</strong> $f'(0)=3$",
            micro: { title: "Key values at x=0", body: "$e^0=1$ and $\\sin(0)=0$ — these come up constantly when evaluating derivatives at the origin." } }
        ] },
      { q: "Find the equation of the tangent to $y=\\sin x$ at $x=\\dfrac{\\pi}{3}$.",
        steps: [
          { text: "Find the y-coordinate: $y\\left(\\frac{\\pi}{3}\\right) = \\sin\\left(\\frac{\\pi}{3}\\right) = \\dfrac{\\sqrt3}{2}$",
            micro: { title: "Exact trig values", body: "$\\sin(\\pi/3) = \\frac{\\sqrt3}{2}$, $\\cos(\\pi/3)=\\frac12$ — memorise the exact values at multiples of $\\pi/6$ and $\\pi/4$." } },
          { text: "Find the gradient: $y' = \\cos x$, so gradient at $x=\\frac\\pi3$ is $\\cos\\left(\\frac\\pi3\\right) = \\dfrac12$",
            micro: null },
          { text: "Use point-gradient form: $y - \\dfrac{\\sqrt3}{2} = \\dfrac12\\left(x-\\dfrac\\pi3\\right)$<br><strong>Answer:</strong> $y = \\dfrac12 x - \\dfrac{\\pi}{6} + \\dfrac{\\sqrt3}{2}$",
            micro: { title: "Point-gradient tangent formula", body: "$y - y_1 = m(x-x_1)$ where $m$ is the gradient and $(x_1,y_1)$ is the point of tangency. Expand and simplify to get the final line equation." } }
        ] },
    ],
    hard: [
      { q: "Show that the curve $y = e^x - x$ has exactly one stationary point, and determine its nature.",
        steps: [
          { text: "Differentiate: $y' = e^x - 1$",
            micro: null },
          { text: "Set $y'=0$: $e^x-1=0 \\Rightarrow e^x=1 \\Rightarrow x=0$ (using $\\ln$ both sides, or recognising $e^0=1$ directly).",
            micro: { title: "Solving exponential equations", body: "$e^x=1$ has exactly one solution since $e^x$ is one-to-one (strictly increasing) — take $\\ln$ of both sides: $x=\\ln 1=0$." } },
          { text: "Since $e^x$ is strictly increasing for all $x$, $y'=e^x-1$ can only equal zero once — confirming exactly one stationary point, at $x=0$.",
            micro: { title: "Why uniqueness follows from monotonicity", body: "If a function is strictly increasing everywhere, it can cross any horizontal value (like $y'=0$) at most once. This is a clean way to argue uniqueness without solving a messy equation." } },
          { text: "Determine nature using $y''=e^x$. At $x=0$: $y''(0) = e^0 = 1 > 0$, so this is a local minimum.<br><strong>Conclusion:</strong> exactly one stationary point at $x=0$, which is a local minimum.",
            micro: null }
        ] },
    ]
  },

  prodquot: {
    easy: [
      { q: "Differentiate $f(x) = x^2 e^x$",
        steps: [
          { text: "Identify this as a product: $u=x^2$, $v=e^x$.",
            micro: { title: "Recognising a product", body: "Whenever two distinct functions of $x$ are multiplied together (not added), reach for the product rule." } },
          { text: "Find $u'=2x$ and $v'=e^x$.", micro: null },
          { text: "Apply $u'v+uv'$: $f'(x) = 2xe^x + x^2e^x$<br><strong>Optionally factorise:</strong> $= xe^x(2+x)$",
            micro: { title: "Factorising for a cleaner answer", body: "Both terms share $xe^x$. Pulling this out: $2xe^x+x^2e^x = xe^x(2+x)$. WACE markers often prefer (but don't always require) a factorised final form." } }
        ] },
    ],
    medium: [
      { q: "Differentiate $f(x) = \\dfrac{x^2}{\\cos x}$",
        steps: [
          { text: "Identify $u=x^2$ (top) and $v=\\cos x$ (bottom) for the quotient rule.",
            micro: { title: "Labelling for quotient rule", body: "Always write $u$ = numerator, $v$ = denominator <em>before</em> substituting into the formula $\\frac{u'v-uv'}{v^2}$ — this avoids mixing up the order, which matters here (unlike the product rule)." } },
          { text: "Find $u'=2x$ and $v'=-\\sin x$.",
            micro: null },
          { text: "Substitute into $\\dfrac{u'v-uv'}{v^2}$: $f'(x) = \\dfrac{2x\\cos x - x^2(-\\sin x)}{\\cos^2 x} = \\dfrac{2x\\cos x + x^2\\sin x}{\\cos^2 x}$",
            micro: { title: "Watch the double negative", body: "$-uv' = -(x^2)(-\\sin x) = +x^2\\sin x$. Two negatives in a row (the formula's minus, and $v'=-\\sin x$) combine to give a plus — a frequent place where sign errors creep in." } }
        ] },
      { q: "Differentiate $f(x) = e^{-x}\\sin x$",
        steps: [
          { text: "Identify the product: $u=e^{-x}$, $v=\\sin x$.", micro: null },
          { text: "Find $u'$ using chain rule: $u'=-e^{-x}$ (inner derivative of $-x$ is $-1$). Find $v'=\\cos x$.",
            micro: { title: "Chain rule inside a product rule", body: "When one of $u$ or $v$ is itself a composite function (like $e^{-x}$), you may need the chain rule just to find that piece's derivative, before plugging into the product rule formula." } },
          { text: "Apply $u'v+uv'$: $f'(x) = -e^{-x}\\sin x + e^{-x}\\cos x = e^{-x}(\\cos x - \\sin x)$<br><strong>Answer:</strong> $f'(x) = e^{-x}(\\cos x-\\sin x)$",
            micro: null }
        ] },
    ],
    hard: [
      { q: "Differentiate $f(x) = \\dfrac{(3x-3)^3}{x^2}$ fully, expressing your answer as a single fraction with positive indices.",
        steps: [
          { text: "Let $u=(3x-3)^3$, $v=x^2$. Find $u'$ using the chain rule: outer power rule, multiply by inner derivative (3).<br>$u' = 3(3x-3)^2 \\times 3 = 9(3x-3)^2$",
            micro: { title: "Chain rule on a bracket to a power", body: "$(3x-3)^3$: outer function is $(\\square)^3$, inner is $3x-3$. Differentiate outer: $3(\\square)^2$, multiply by inner derivative ($3$): $3(3x-3)^2 \\times 3 = 9(3x-3)^2$." } },
          { text: "Find $v'=2x$.", micro: null },
          { text: "Apply the quotient rule: $f'(x) = \\dfrac{u'v-uv'}{v^2} = \\dfrac{9(3x-3)^2 \\cdot x^2 - (3x-3)^3 \\cdot 2x}{x^4}$",
            micro: null },
          { text: "Factor out common terms from the numerator: both terms share $x(3x-3)^2$.<br>$= \\dfrac{x(3x-3)^2\\big[9x - 2(3x-3)\\big]}{x^4} = \\dfrac{(3x-3)^2(3x+6)}{x^3}$",
            micro: { title: "Simplifying the bracket", body: "$9x - 2(3x-3) = 9x-6x+6=3x+6$. Always expand and simplify what's left inside brackets after factoring, rather than leaving it unsimplified." } },
          { text: "<strong>Answer:</strong> $f'(x) = \\dfrac{(3x-3)^2(3x+6)}{x^3}$ (positive indices, single fraction) ✓", micro: null }
        ] },
    ]
  },

  chain: {
    easy: [
      { q: "Differentiate $f(x) = (3x-3)^3$",
        steps: [
          { text: "Identify outer and inner functions: outer is $(\\square)^3$, inner is $3x-3$.",
            micro: { title: "Spotting a composite function", body: "If you can describe the function as 'something to a power' or 'sin/cos/e of something', that 'something' is the inner function — and you need the chain rule." } },
          { text: "Differentiate the outer (power rule), keeping the inner unchanged: $3(3x-3)^2$. Multiply by the inner derivative ($3$).<br><strong>Answer:</strong> $f'(x) = 9(3x-3)^2$",
            micro: { title: "The 'outer then inner' process", body: "Step 1: differentiate as if the bracket were just $x$. Step 2: multiply the whole thing by the derivative of what's actually inside the bracket." } }
        ] },
    ],
    medium: [
      { q: "Differentiate $f(x) = \\sin(3x^2)$",
        steps: [
          { text: "Outer function: $\\sin(\\square)$. Inner function: $3x^2$.", micro: null },
          { text: "Differentiate outer (gives $\\cos(\\square)$, inner unchanged), then multiply by inner derivative ($6x$).<br><strong>Answer:</strong> $f'(x) = 6x\\cos(3x^2)$",
            micro: { title: "Common chain rule pairing", body: "$\\frac{d}{dx}\\sin(g(x)) = g'(x)\\cos(g(x))$. Memorise this pattern — it appears constantly with $g(x) = $ any polynomial or simple expression." } }
        ] },
      { q: "Differentiate $f(x) = e^{x^2+1}$",
        steps: [
          { text: "Outer: $e^{\\square}$. Inner: $x^2+1$.", micro: null },
          { text: "Differentiate outer (stays $e^{\\square}$ since that's special to $e^x$), multiply by inner derivative ($2x$).<br><strong>Answer:</strong> $f'(x) = 2xe^{x^2+1}$",
            micro: { title: "Why e^x is special here", body: "Unlike most functions, differentiating $e^{\\square}$ gives back $e^{\\square}$ unchanged — only the chain rule multiplier (inner derivative) gets added on." } }
        ] },
    ],
    hard: [
      { q: "Differentiate $f(x) = \\sqrt{4x^3+1}$, then find the gradient at $x=1$.",
        steps: [
          { text: "Rewrite as a power: $f(x) = (4x^3+1)^{1/2}$. Outer: $(\\square)^{1/2}$, inner: $4x^3+1$.",
            micro: { title: "Roots are fractional powers", body: "Always convert $\\sqrt{\\;}$ to power notation before applying the chain rule, since the power rule for the outer function needs a numerical index." } },
          { text: "Differentiate outer: $\\frac12(\\square)^{-1/2}$. Multiply by inner derivative ($12x^2$).<br>$f'(x) = \\dfrac12(4x^3+1)^{-1/2} \\times 12x^2 = 6x^2(4x^3+1)^{-1/2}$",
            micro: null },
          { text: "Rewrite with positive index: $f'(x) = \\dfrac{6x^2}{\\sqrt{4x^3+1}}$",
            micro: { title: "Converting back to root notation", body: "$(\\square)^{-1/2} = \\dfrac{1}{(\\square)^{1/2}} = \\dfrac{1}{\\sqrt{\\square}}$. Final answers are usually cleaner with a root in the denominator rather than a negative fractional index." } },
          { text: "Substitute $x=1$: $f'(1) = \\dfrac{6(1)}{\\sqrt{4(1)+1}} = \\dfrac{6}{\\sqrt5}$<br><strong>Answer:</strong> gradient at $x=1$ is $\\dfrac{6}{\\sqrt5}$ (or $\\dfrac{6\\sqrt5}{5}$ rationalised)",
            micro: { title: "Rationalising the denominator", body: "$\\dfrac{6}{\\sqrt5} = \\dfrac{6}{\\sqrt5}\\times\\dfrac{\\sqrt5}{\\sqrt5} = \\dfrac{6\\sqrt5}{5}$. WACE often accepts either form, but rationalised is the more traditional 'exact' presentation." } }
        ] },
    ]
  },

  applications: {
    easy: [
      { q: "Find the stationary points of $y=x^2-4x+1$ and state their nature.",
        steps: [
          { text: "Differentiate and set equal to zero: $y'=2x-4=0 \\Rightarrow x=2$",
            micro: { title: "Finding stationary points", body: "Stationary points always occur where the gradient is zero — solve $f'(x)=0$ for $x$, then find the corresponding $y$-value if needed." } },
          { text: "Find the nature using the second derivative: $y''=2$, which is always positive.<br><strong>Answer:</strong> $x=2$ is a local minimum (since $y''>0$)",
            micro: { title: "Second derivative test reminder", body: "$y''>0 \\Rightarrow$ concave up $\\Rightarrow$ local minimum. $y''<0 \\Rightarrow$ concave down $\\Rightarrow$ local maximum. If $y''=0$, the test is inconclusive and you must check the sign of $y'$ either side instead." } }
        ] },
    ],
    medium: [
      { q: "Find and classify the stationary points of $f(x) = x^3-3x^2-9x+5$.",
        steps: [
          { text: "Differentiate: $f'(x)=3x^2-6x-9$. Set equal to zero and solve.<br>$3x^2-6x-9=0 \\Rightarrow x^2-2x-3=0 \\Rightarrow (x-3)(x+1)=0 \\Rightarrow x=3,-1$",
            micro: { title: "Solving the stationary point equation", body: "Divide through by the common factor 3 first to simplify, then factorise the resulting quadratic as usual." } },
          { text: "Find $f''(x) = 6x-6$. Test each point: $f''(3)=12>0$ (local min). $f''(-1)=-12<0$ (local max).",
            micro: null },
          { text: "<strong>Answer:</strong> local maximum at $x=-1$, local minimum at $x=3$.", micro: null }
        ] },
      { q: "A rectangular garden has a perimeter of 40 m. Find the dimensions that maximise its area.",
        steps: [
          { text: "Let length $=x$, width $=w$. Perimeter condition: $2x+2w=40 \\Rightarrow w=20-x$.",
            micro: { title: "Reducing to one variable", body: "Optimisation problems with a constraint (like fixed perimeter) need that constraint solved for one variable, so the quantity to optimise becomes a function of a single variable." } },
          { text: "Write area as a function of $x$ only: $A(x) = x(20-x) = 20x-x^2$", micro: null },
          { text: "Differentiate and set to zero: $A\'(x)=20-2x=0 \\Rightarrow x=10$",
            micro: null },
          { text: "Check it's a maximum: $A''(x)=-2<0$, confirming a maximum. Then $w=20-10=10$.<br><strong>Answer:</strong> the garden is a $10\\text{ m} \\times 10\\text{ m}$ square, giving maximum area $100\\text{ m}^2$.",
            micro: { title: "Why a square often maximises area", body: "For a fixed perimeter rectangle, the maximum-area shape is always a square — a useful pattern to recognise and sanity-check your answer against." } }
        ] },
    ],
    hard: [
      { q: "An open box is made from a square sheet of metal with side 12 cm, by cutting squares of side $x$ from each corner and folding up the sides. Show that the volume is $V(x)=4x^3-48x^2+144x$, and hence find the value of $x$ that maximises the volume.",
        steps: [
          { text: "After cutting squares of side $x$ from each corner and folding, the base becomes a square of side $(12-2x)$, and the height is $x$.",
            micro: { title: "Visualising the box", body: "Picture the flat sheet: removing an $x \\times x$ square from each of the 4 corners leaves flaps of length $x$ that fold up to become the box's height, while the remaining base shrinks by $2x$ on each side." } },
          { text: "Volume $= \\text{base area} \\times \\text{height} = (12-2x)^2 \\times x$",
            micro: null },
          { text: "Expand: $(12-2x)^2 = 144-48x+4x^2$. So $V(x) = x(144-48x+4x^2) = 144x-48x^2+4x^3 = 4x^3-48x^2+144x$ ✓ <strong>(shown)</strong>",
            micro: { title: "Careful expansion of a binomial square", body: "$(a-b)^2=a^2-2ab+b^2$ with $a=12,b=2x$: $144 - 2(12)(2x) + 4x^2 = 144-48x+4x^2$." } },
          { text: "Differentiate: $V'(x)=12x^2-96x+144$. Set to zero: $12x^2-96x+144=0 \\Rightarrow x^2-8x+12=0 \\Rightarrow (x-2)(x-6)=0 \\Rightarrow x=2,6$",
            micro: { title: "Rejecting invalid solutions", body: "$x=6$ would mean cutting a 6 cm square from a 12 cm sheet on each side — leaving zero base length, which isn't a valid box. Always check solutions make physical sense in context." } },
          { text: "Since $x=6$ gives an invalid (zero-volume, degenerate) box, test $x=2$: $V''(x)=24x-96$, so $V''(2)=48-96=-48<0$, confirming a maximum.<br><strong>Answer:</strong> $x=2$ cm maximises the volume.",
            micro: null }
        ] },
    ]
  }
};



// Extra WACE-aligned derivative practice added to match the Integration bank depth.
// Covers Unit 3 differentiation: exponential/trig rules, product/quotient/chain,
// second derivative, small increments, kinematics, concavity and optimisation.
DBANK.power.hard.push({
  q: "Using first principles, show that $\\dfrac{d}{dx}(x^2)=2x$.",
  steps: [
    { text: "Start with the limit definition: $f'(x)=\\displaystyle\\lim_{h\\to0}\\dfrac{f(x+h)-f(x)}{h}$.", micro: { title: "First principles structure", body: "First principles means forming the average rate of change over a small interval $h$, simplifying, then taking the limit as $h\\to0$." } },
    { text: "For $f(x)=x^2$: $\\dfrac{f(x+h)-f(x)}{h}=\\dfrac{(x+h)^2-x^2}{h}$.", micro: null },
    { text: "Expand and simplify: $\\dfrac{x^2+2xh+h^2-x^2}{h}=\\dfrac{2xh+h^2}{h}=2x+h$.", micro: { title: "Why cancel $h$ first?", body: "Before simplifying, substituting $h=0$ would give $0/0$. The algebra removes the factor causing the indeterminate form." } },
    { text: "Take the limit: $\\displaystyle\\lim_{h\\to0}(2x+h)=2x$. <br><strong>Shown:</strong> $\\dfrac{d}{dx}(x^2)=2x$.", micro: null }
  ]
});

DBANK.trigexp.medium.push({
  q: "Find the equation of the tangent to $y=e^{2x}$ at $x=0$.",
  steps: [
    { text: "Find the point of tangency: $y(0)=e^0=1$, so the point is $(0,1)$.", micro: null },
    { text: "Differentiate: $y'=2e^{2x}$. At $x=0$, the gradient is $2e^0=2$.", micro: { title: "Tangent recipe", body: "A tangent line needs two ingredients: the point from the original function, and the gradient from the derivative." } },
    { text: "Use point-gradient form: $y-1=2(x-0)$.", micro: null },
    { text: "<strong>Answer:</strong> $y=2x+1$.", micro: null }
  ]
});

DBANK.trigexp.hard.push({
  q: "A population is modelled by $P(t)=1200e^{0.04t}$, where $t$ is measured in years. Find $P'(10)$ and interpret it in context.",
  steps: [
    { text: "Differentiate the exponential model: $P'(t)=1200(0.04)e^{0.04t}=48e^{0.04t}$.", micro: { title: "$Ae^{kt}$ derivative", body: "$\\frac{d}{dt}(Ae^{kt})=kAe^{kt}$. The derivative has units of population per year." } },
    { text: "Substitute $t=10$: $P'(10)=48e^{0.4}$.", micro: null },
    { text: "As a decimal, $48e^{0.4}\\approx71.6$.", micro: null },
    { text: "<strong>Answer:</strong> after 10 years, the population is increasing at about $72$ people per year. Exact rate: $48e^{0.4}$ people/year.", micro: { title: "Derivative vs value", body: "$P(10)$ is the population size. $P'(10)$ is how fast the population is changing at that instant." } }
  ]
});

DBANK.prodquot.hard.push({
  q: "Show that if $y=\\tan x=\\dfrac{\\sin x}{\\cos x}$, then $\\dfrac{dy}{dx}=\\dfrac{1}{\\cos^2x}$.",
  steps: [
    { text: "Use quotient rule with $u=\\sin x$ and $v=\\cos x$.", micro: { title: "Deriving a standard result", body: "Even if you know $\\frac{d}{dx}\\tan x=\\sec^2x$, WACE-style questions may ask you to establish it from $\\sin x/\\cos x$." } },
    { text: "Find $u'=\\cos x$ and $v'=-\\sin x$.", micro: null },
    { text: "Apply the quotient rule: $\\dfrac{dy}{dx}=\\dfrac{\\cos x\\cos x-\\sin x(-\\sin x)}{\\cos^2x}=\\dfrac{\\cos^2x+\\sin^2x}{\\cos^2x}$.", micro: null },
    { text: "Use $\\sin^2x+\\cos^2x=1$. <br><strong>Shown:</strong> $\\dfrac{dy}{dx}=\\dfrac{1}{\\cos^2x}$.", micro: { title: "Finishing a 'show that'", body: "Keep simplifying until your expression exactly matches the target form." } }
  ]
});

DBANK.chain.hard.push({
  q: "Differentiate $f(x)=\\dfrac12x^2\\sqrt[3]{1-3x}$.",
  steps: [
    { text: "Rewrite the cube root: $f(x)=\\dfrac12x^2(1-3x)^{1/3}$.", micro: { title: "Choose the outer structure", body: "This is a product overall. The second factor is a composite power, so product rule and chain rule are both needed." } },
    { text: "Let $u=\\dfrac12x^2$ and $v=(1-3x)^{1/3}$. Then $u'=x$.", micro: null },
    { text: "Differentiate $v$: $v'=\\dfrac13(1-3x)^{-2/3}(-3)=-(1-3x)^{-2/3}$.", micro: { title: "Inner derivative", body: "The derivative of $1-3x$ is $-3$, which cancels with the $\\frac13$ from the outer power." } },
    { text: "Apply product rule: $f'(x)=x(1-3x)^{1/3}-\\dfrac12x^2(1-3x)^{-2/3}$.", micro: null },
    { text: "<strong>Answer:</strong> $f'(x)=x\\sqrt[3]{1-3x}-\\dfrac{x^2}{2(1-3x)^{2/3}}$.", micro: null }
  ]
});

DBANK.applications.easy.push({
  q: "Use $\\delta y\\approx\\dfrac{dy}{dx}\\delta x$ to estimate the increase in $y=x^2$ when $x$ increases from $2$ to $2.04$.",
  steps: [
    { text: "Differentiate: $\\dfrac{dy}{dx}=2x$.", micro: { title: "Small increments formula", body: "$\\delta y\\approx y'(x)\\delta x$ uses the tangent gradient to estimate a small change in the function value." } },
    { text: "At $x=2$, the gradient is $2(2)=4$. The increment is $\\delta x=2.04-2=0.04$.", micro: null },
    { text: "$\\delta y\\approx4(0.04)=0.16$.", micro: null },
    { text: "<strong>Answer:</strong> $y$ increases by approximately $0.16$.", micro: null }
  ]
});

DBANK.applications.medium.push({
  q: "A particle has position $s(t)=t^3-6t^2+9t$ metres. Find its velocity and acceleration at $t=2$ seconds, and state whether it is speeding up or slowing down then.",
  steps: [
    { text: "Velocity is the first derivative: $v(t)=s'(t)=3t^2-12t+9$.", micro: { title: "Kinematics derivative chain", body: "Position differentiates to velocity. Velocity differentiates to acceleration, so acceleration is the second derivative of position." } },
    { text: "Acceleration is $a(t)=v'(t)=s''(t)=6t-12$.", micro: null },
    { text: "At $t=2$: $v(2)=12-24+9=-3$ m/s and $a(2)=12-12=0$ m/s².", micro: null },
    { text: "Since acceleration is zero at that instant, the speed is momentarily not increasing or decreasing. <br><strong>Answer:</strong> $v(2)=-3$ m/s, $a(2)=0$ m/s².", micro: { title: "Speeding up test", body: "Speed increases when velocity and acceleration have the same sign, and decreases when they have opposite signs. Here acceleration is zero." } }
  ]
});

DBANK.applications.hard.push({
  q: "A rectangle is placed under the parabola $y=12-x^2$ above the x-axis, with upper corners on the curve and base on the x-axis. If it is symmetric about the y-axis, find the maximum possible area.",
  steps: [
    { text: "Let the right upper corner be $(x,12-x^2)$ with $x>0$. By symmetry, the rectangle has width $2x$ and height $12-x^2$.", micro: { title: "Build one function", body: "Optimisation starts by translating the geometry into one variable. Here symmetry gives the full width from the right-hand $x$ value." } },
    { text: "Area: $A(x)=2x(12-x^2)=24x-2x^3$, for $0<x<\\sqrt{12}$.", micro: null },
    { text: "Differentiate and set to zero: $A\'(x)=24-6x^2=0 \\Rightarrow x^2=4 \\Rightarrow x=2$.", micro: null },
    { text: "Check maximum: $A''(x)=-12x$, so $A''(2)=-24<0$.", micro: { title: "Justifying an optimum", body: "For a hard optimisation question, finding the stationary point is not enough. You must justify it is a maximum or minimum." } },
    { text: "Maximum area: $A(2)=24(2)-2(8)=32$. <br><strong>Answer:</strong> the maximum area is $32$ square units.", micro: null }
  ]
});

DBANK.applications.hard.push({
  q: "For $f(x)=x^4-4x^3$, find all stationary points and points of inflection, then state the concavity intervals.",
  steps: [
    { text: "Find $f'(x)=4x^3-12x^2=4x^2(x-3)$, so stationary points occur at $x=0$ and $x=3$.", micro: { title: "Repeated stationary root", body: "The factor $x^2$ means the derivative touches zero at $x=0$. That often signals a stationary point of inflection rather than a max/min." } },
    { text: "Find $f''(x)=12x^2-24x=12x(x-2)$.", micro: null },
    { text: "Candidates for inflection occur when $f''(x)=0$: $x=0$ and $x=2$.", micro: { title: "Candidate only", body: "$f''=0$ is not enough by itself. A point of inflection requires concavity to change sign." } },
    { text: "Check the sign of $f''$: positive on $(-\\infty,0)$, negative on $(0,2)$, and positive on $(2,\\infty)$, so concavity changes at both $x=0$ and $x=2$.", micro: null },
    { text: "Classify stationary points: $x=3$ has $f''(3)>0$, so it is a local minimum. At $x=0$, concavity changes and $f'=0$, so it is a stationary point of inflection. <br><strong>Answer:</strong> concave up on $(-\\infty,0)\\cup(2,\\infty)$, concave down on $(0,2)$; inflections at $x=0,2$.", micro: null }
  ]
});

function renderDTier(topic, tier) {
  const container = document.getElementById('dtier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (DBANK[topic] && DBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: 'd/dx Easy', medium: 'd/dx Medium', hard: 'd/dx Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];

  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;

  questions.forEach((qd, qi) => {
    const cardId = `d-${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header">
        <span class="q-number">Q${qi+1}</span>
        <div class="q-text">${protectMathHTML(qd.q)}</div>
      </div>
      <div class="q-actions">
        <button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button>
      </div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div>
        <div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span>
          <span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) {
        html += `<span class="exp-step-hint-tag">stuck?</span>`;
      }
      html += `<span class="exp-step-chevron">▶</span>
        </div>`;
      if (step.micro) {
        html += `<div class="exp-step-micro">
          <div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div>
          <div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div>
        </div>`;
      }
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

function initDerivativesBank() {
  ['power','trigexp','prodquot','chain','applications'].forEach(topic => {
    renderDTier(topic, 'easy');
    renderDTier(topic, 'medium');
    renderDTier(topic, 'hard');
  });
}




// ═══════════════════════════════════════════════════
// DISCRETE RANDOM VARIABLES PAGE — topic/tier navigation + question bank
// ═══════════════════════════════════════════════════
function selectRTopic(topic) {
  document.querySelectorAll('.rtopic-content-block').forEach(b => b.classList.remove('active'));
  document.getElementById('rtopic-' + topic).classList.add('active');
  document.querySelectorAll('.topic-pill-card[data-rtopic]').forEach(c => c.classList.toggle('active', c.dataset.rtopic === topic));
  document.querySelectorAll('.sidebar-item[data-rtopic]').forEach(c => c.classList.toggle('active', c.dataset.rtopic === topic));
  renderRTier(topic, 'easy');
  renderRTier(topic, 'medium');
  renderRTier(topic, 'hard');
  rerenderMath(document.getElementById('rtopic-' + topic));
}

function selectRTier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('rtier-' + topic + '-' + tier).classList.add('active');
}

const RBANK = {
  "probfunc": {
    "easy": [
      {
        "q": "The table below gives a proposed probability function for $X$. Is it valid?<br><br>$\\begin{array}{c|cccc}x&0&1&2&3\\\\hline P(X=x)&0.20&0.35&0.25&0.20\\end{array}$",
        "steps": [
          {
            "text": "Check that every probability is between $0$ and $1$.",
            "micro": {
              "title": "Probability function test 1",
              "body": "A probability cannot be negative and cannot be greater than 1. This is the first thing to check before adding anything."
            }
          },
          {
            "text": "Add the probabilities: $0.20+0.35+0.25+0.20=1.00$.",
            "micro": {
              "title": "Probability function test 2",
              "body": "For a discrete random variable, the probabilities over all possible values must add to exactly $1$. Think: all possible outcomes together must be certain."
            }
          },
          {
            "text": "Since all probabilities are valid and the total is $1$, this is a valid probability function.<br><strong>Answer:</strong> valid.",
            "micro": null
          }
        ]
      },
      {
        "q": "Find $k$ so the following table is a probability function.<br><br>$\\begin{array}{c|cccc}x&1&2&3&4\\\\hline P(X=x)&0.10&0.25&k&0.30\\end{array}$",
        "steps": [
          {
            "text": "Use the rule that all probabilities must add to $1$.",
            "micro": {
              "title": "Missing probability idea",
              "body": "If exactly one probability is missing, it is usually found by subtracting the known probabilities from $1$."
            }
          },
          {
            "text": "$0.10+0.25+k+0.30=1$.",
            "micro": null
          },
          {
            "text": "$0.65+k=1 \\Rightarrow k=0.35$.<br><strong>Answer:</strong> $k=0.35$.",
            "micro": {
              "title": "Sanity check",
              "body": "The missing probability should be between $0$ and $1$. Here $0.35$ is sensible, so the table can be valid."
            }
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A discrete random variable has $P(X=0)=a$, $P(X=1)=0.25$, $P(X=2)=2a$ and $P(X=3)=0.15$. Find $a$.",
        "steps": [
          {
            "text": "Use the total probability condition: $a+0.25+2a+0.15=1$.",
            "micro": {
              "title": "Unknowns in probability tables",
              "body": "Even when there are several entries involving the same unknown, the first equation is almost always $\\sum P(X=x)=1$."
            }
          },
          {
            "text": "Combine like terms: $3a+0.40=1$.",
            "micro": null
          },
          {
            "text": "$3a=0.60 \\Rightarrow a=0.20$.<br><strong>Answer:</strong> $a=0.20$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A fair spinner has five equally likely outcomes labelled $2,2,3,5,8$. Let $X$ be the number spun. Write the probability function for $X$.",
        "steps": [
          {
            "text": "List the distinct possible values of $X$: $2,3,5,8$.",
            "micro": {
              "title": "Outcomes vs values",
              "body": "The spinner has five outcomes, but $X$ does not have five different values because the label $2$ appears twice."
            }
          },
          {
            "text": "Count how many spinner sectors give each value. $2$ occurs twice, while $3,5,8$ each occur once.",
            "micro": null
          },
          {
            "text": "So $P(X=2)=\\frac25$ and $P(X=3)=P(X=5)=P(X=8)=\\frac15$.<br><strong>Answer:</strong> $\\begin{array}{c|cccc}x&2&3&5&8\\\\hline P(X=x)&\\frac25&\\frac15&\\frac15&\\frac15\\end{array}$",
            "micro": {
              "title": "Uniform outcomes, not uniform variable",
              "body": "The spinner sectors are equally likely, but the random variable is not uniform because some values may appear on more sectors than others."
            }
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A random variable has $P(X=x)=kx$ for $x=1,2,3,4$. Find $k$, then find $P(X\\geq3)$.",
        "steps": [
          {
            "text": "Use $\\sum P(X=x)=1$: $k(1)+k(2)+k(3)+k(4)=1$.",
            "micro": {
              "title": "Formula-defined probability functions",
              "body": "When $P(X=x)$ is given by a formula, substitute every allowed $x$ value into the formula and add the results."
            }
          },
          {
            "text": "$10k=1 \\Rightarrow k=\\frac{1}{10}$.",
            "micro": null
          },
          {
            "text": "$P(X\\geq3)=P(X=3)+P(X=4)=3k+4k=7k=\\frac{7}{10}$.<br><strong>Answer:</strong> $k=\\frac{1}{10}$ and $P(X\\geq3)=\\frac{7}{10}$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A random variable has $P(X=1)=a$, $P(X=2)=b$, $P(X=3)=0.30$ and $P(X=4)=0.10$. Given $P(X\\leq2)=0.60$ and $P(X=2)=2P(X=1)$, find $a$ and $b$.",
        "steps": [
          {
            "text": "Translate the cumulative condition: $P(X\\leq2)=P(X=1)+P(X=2)=a+b=0.60$.",
            "micro": {
              "title": "Reading cumulative language",
              "body": "$X\\leq2$ means include every listed value up to and including $2$. Here that is only $X=1$ and $X=2$."
            }
          },
          {
            "text": "Translate the relationship condition: $P(X=2)=2P(X=1)$, so $b=2a$.",
            "micro": null
          },
          {
            "text": "Substitute into $a+b=0.60$: $a+2a=0.60 \\Rightarrow 3a=0.60 \\Rightarrow a=0.20$.",
            "micro": null
          },
          {
            "text": "Then $b=2a=0.40$.<br><strong>Answer:</strong> $a=0.20$, $b=0.40$.",
            "micro": {
              "title": "Check with total probability",
              "body": "The full total is $0.20+0.40+0.30+0.10=1.00$, confirming the values work."
            }
          }
        ]
      }
    ]
  },
  "expectation": {
    "easy": [
      {
        "q": "For $X$ with probability function below, find $E(X)$.<br><br>$\\begin{array}{c|ccc}x&0&1&2\\\\hline P(X=x)&0.2&0.5&0.3\\end{array}$",
        "steps": [
          {
            "text": "Use $E(X)=\\sum xP(X=x)$.",
            "micro": {
              "title": "Expected value meaning",
              "body": "Expected value is a weighted average. Each value is multiplied by how likely it is, then the products are added."
            }
          },
          {
            "text": "$E(X)=0(0.2)+1(0.5)+2(0.3)$.",
            "micro": null
          },
          {
            "text": "$E(X)=0+0.5+0.6=1.1$.<br><strong>Answer:</strong> $E(X)=1.1$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A game pays $\\$0$, $\\$5$ or $\\$10$ with probabilities $0.50$, $0.30$ and $0.20$ respectively. Find the expected payout.",
        "steps": [
          {
            "text": "Let $X$ be the payout. Use $E(X)=\\sum xP(X=x)$.",
            "micro": {
              "title": "Expected value in context",
              "body": "The expected payout is the long-run average payout per game, not necessarily a payout you can receive in a single game."
            }
          },
          {
            "text": "$E(X)=0(0.50)+5(0.30)+10(0.20)$.",
            "micro": null
          },
          {
            "text": "$E(X)=0+1.50+2.00=3.50$.<br><strong>Answer:</strong> expected payout is $\\$3.50$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A probability function is given below. Find $k$ and then $E(X)$.<br><br>$\\begin{array}{c|ccc}x&1&2&3\\\\hline P(X=x)&k&2k&3k\\end{array}$",
        "steps": [
          {
            "text": "First find $k$ using total probability: $k+2k+3k=1$.",
            "micro": {
              "title": "Order matters",
              "body": "You cannot find $E(X)$ until the probabilities are known. Always determine unknown constants first."
            }
          },
          {
            "text": "$6k=1 \\Rightarrow k=\\frac16$.",
            "micro": null
          },
          {
            "text": "Now calculate $E(X)=1(k)+2(2k)+3(3k)=k+4k+9k=14k$.",
            "micro": null
          },
          {
            "text": "Substitute $k=\\frac16$: $E(X)=\\frac{14}{6}=\\frac73$.<br><strong>Answer:</strong> $k=\\frac16$, $E(X)=\\frac73$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A raffle ticket costs $\\$2$. The prize $Y$ is $\\$20$ with probability $0.1$ and $\\$0$ otherwise. Let $X$ be the net gain after buying one ticket. Find $E(X)$.",
        "steps": [
          {
            "text": "Convert prize values into net gain values by subtracting the $\\$2$ ticket cost.",
            "micro": {
              "title": "Net gain vs prize",
              "body": "A common mistake is to use the prize amount only. Net gain must include the cost of entering the game."
            }
          },
          {
            "text": "If the ticket wins: $X=20-2=18$. If it loses: $X=0-2=-2$.",
            "micro": null
          },
          {
            "text": "$E(X)=18(0.1)+(-2)(0.9)=1.8-1.8=0$.<br><strong>Answer:</strong> $E(X)=0$, so the game is fair in expected value.",
            "micro": {
              "title": "Fair game",
              "body": "A game is called fair when the expected net gain is $0$. Over many plays, neither side has an average advantage."
            }
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A random variable has $P(X=0)=a$, $P(X=1)=0.20$, $P(X=2)=b$ and $P(X=3)=0.10$. Given $E(X)=1.4$, find $a$ and $b$.",
        "steps": [
          {
            "text": "Use total probability: $a+0.20+b+0.10=1$, so $a+b=0.70$. Equation ①.",
            "micro": {
              "title": "Two unknowns need two equations",
              "body": "Hard DRV questions often give one probability equation and one expected-value equation. You need both to solve the unknowns."
            }
          },
          {
            "text": "Use expected value: $0a+1(0.20)+2b+3(0.10)=1.4$.",
            "micro": null
          },
          {
            "text": "$0.20+2b+0.30=1.4 \\Rightarrow 2b+0.50=1.4 \\Rightarrow 2b=0.90 \\Rightarrow b=0.45$.",
            "micro": null
          },
          {
            "text": "From ①, $a=0.70-0.45=0.25$.<br><strong>Answer:</strong> $a=0.25$, $b=0.45$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A charity game costs $\\$4$ to play. A player wins $\\$15$ if a red ball is drawn, $\\$5$ if a blue ball is drawn, and nothing otherwise. The probabilities are $0.20$, $0.30$ and $0.50$. Find the expected net gain and interpret it.",
        "steps": [
          {
            "text": "Convert each outcome to net gain: red $=15-4=11$, blue $=5-4=1$, otherwise $=0-4=-4$.",
            "micro": {
              "title": "Context interpretation",
              "body": "For decision questions, define exactly what the random variable measures. Here it is not winnings; it is net gain after the cost."
            }
          },
          {
            "text": "Compute $E(X)=11(0.20)+1(0.30)+(-4)(0.50)$.",
            "micro": null
          },
          {
            "text": "$E(X)=2.20+0.30-2.00=0.50$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> the expected net gain is $\\$0.50$ per play, so the player gains $50$ cents per game on average in the long run.",
            "micro": {
              "title": "Long-run language",
              "body": "Expected value does not predict one result. It describes the average result over many repetitions of the same random process."
            }
          }
        ]
      }
    ]
  },
  "variance": {
    "easy": [
      {
        "q": "For $X$ with $E(X)=2$, calculate $\\operatorname{Var}(X)$ using the table.<br><br>$\\begin{array}{c|ccc}x&1&2&3\\\\hline P(X=x)&0.25&0.50&0.25\\end{array}$",
        "steps": [
          {
            "text": "Use $\\operatorname{Var}(X)=\\sum p(x-\\mu)^2$, where $\\mu=E(X)=2$.",
            "micro": {
              "title": "Variance meaning",
              "body": "Variance measures spread around the mean. The squared distance $(x-\\mu)^2$ tells us how far each value is from the mean, ignoring sign."
            }
          },
          {
            "text": "$\\operatorname{Var}(X)=0.25(1-2)^2+0.50(2-2)^2+0.25(3-2)^2$.",
            "micro": null
          },
          {
            "text": "$=0.25(1)+0+0.25(1)=0.50$.<br><strong>Answer:</strong> $\\operatorname{Var}(X)=0.5$.",
            "micro": null
          }
        ]
      },
      {
        "q": "If $\\operatorname{Var}(X)=9$, find the standard deviation of $X$.",
        "steps": [
          {
            "text": "Standard deviation is the square root of variance: $\\sigma=\\sqrt{\\operatorname{Var}(X)}$.",
            "micro": {
              "title": "Variance vs standard deviation",
              "body": "Variance is in squared units. Standard deviation returns the spread to the original units of the random variable."
            }
          },
          {
            "text": "$\\sigma=\\sqrt{9}=3$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> standard deviation $=3$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "For the table below, find $E(X)$, $E(X^2)$ and $\\operatorname{Var}(X)$.<br><br>$\\begin{array}{c|ccc}x&0&2&4\\\\hline P(X=x)&0.25&0.50&0.25\\end{array}$",
        "steps": [
          {
            "text": "Find the mean: $E(X)=0(0.25)+2(0.50)+4(0.25)=2$.",
            "micro": {
              "title": "Shortcut variance formula",
              "body": "A common WACE method is $\\operatorname{Var}(X)=E(X^2)-[E(X)]^2$. This is often faster than summing squared deviations."
            }
          },
          {
            "text": "Find $E(X^2)=0^2(0.25)+2^2(0.50)+4^2(0.25)=0+2+4=6$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(X)=E(X^2)-[E(X)]^2=6-2^2=2$.<br><strong>Answer:</strong> $E(X)=2$, $E(X^2)=6$, $\\operatorname{Var}(X)=2$.",
            "micro": null
          }
        ]
      },
      {
        "q": "Given $E(X)=5$ and $\\operatorname{Var}(X)=4$, find $E(3X-2)$ and $\\operatorname{Var}(3X-2)$.",
        "steps": [
          {
            "text": "Use the linear transformation rules: $E(aX+b)=aE(X)+b$ and $\\operatorname{Var}(aX+b)=a^2\\operatorname{Var}(X)$.",
            "micro": {
              "title": "Shift vs scale",
              "body": "Adding or subtracting changes the centre but not the spread. Multiplying scales the spread, so variance is multiplied by the square of the scale factor."
            }
          },
          {
            "text": "$E(3X-2)=3E(X)-2=3(5)-2=13$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(3X-2)=3^2\\operatorname{Var}(X)=9(4)=36$.<br><strong>Answer:</strong> $E(3X-2)=13$, $\\operatorname{Var}(3X-2)=36$.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A random variable has $P(X=1)=0.2$, $P(X=2)=0.5$ and $P(X=5)=0.3$. Find $\\operatorname{Var}(2X+1)$.",
        "steps": [
          {
            "text": "First find $E(X)=1(0.2)+2(0.5)+5(0.3)=0.2+1+1.5=2.7$.",
            "micro": {
              "title": "Plan for transformed variance",
              "body": "To find $\\operatorname{Var}(2X+1)$, first find $\\operatorname{Var}(X)$, then use the transformation rule. The $+1$ will not affect variance."
            }
          },
          {
            "text": "Find $E(X^2)=1^2(0.2)+2^2(0.5)+5^2(0.3)=0.2+2+7.5=9.7$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(X)=9.7-(2.7)^2=9.7-7.29=2.41$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(2X+1)=2^2\\operatorname{Var}(X)=4(2.41)=9.64$.<br><strong>Answer:</strong> $9.64$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A distribution has $E(X)=3$ and $\\operatorname{Var}(X)=2$. A teacher defines $Y=10X+50$ to convert a score to a scaled mark. Find the mean and standard deviation of $Y$.",
        "steps": [
          {
            "text": "For the mean: $E(Y)=E(10X+50)=10E(X)+50$.",
            "micro": {
              "title": "Mean transforms linearly",
              "body": "A linear transformation moves the average in the same way it moves every data value."
            }
          },
          {
            "text": "$E(Y)=10(3)+50=80$.",
            "micro": null
          },
          {
            "text": "For standard deviation, scale by the absolute value of the multiplier: $\\sigma_Y=|10|\\sigma_X$ where $\\sigma_X=\\sqrt2$.",
            "micro": {
              "title": "Standard deviation, not variance",
              "body": "Variance multiplies by $a^2$, but standard deviation multiplies by $|a|$. Adding $50$ does not change spread."
            }
          },
          {
            "text": "So $\\sigma_Y=10\\sqrt2$.<br><strong>Answer:</strong> mean $80$, standard deviation $10\\sqrt2$.",
            "micro": null
          }
        ]
      }
    ]
  },
  "cdftrans": {
    "easy": [
      {
        "q": "For the table below, find $P(X\\leq2)$.<br><br>$\\begin{array}{c|cccc}x&0&1&2&3\\\\hline P(X=x)&0.1&0.2&0.4&0.3\\end{array}$",
        "steps": [
          {
            "text": "$X\\leq2$ means include $X=0$, $X=1$ and $X=2$.",
            "micro": {
              "title": "Cumulative probability",
              "body": "Cumulative means adding probabilities up to a boundary. The word 'less than or equal to' includes the boundary value."
            }
          },
          {
            "text": "$P(X\\leq2)=0.1+0.2+0.4=0.7$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $P(X\\leq2)=0.7$.",
            "micro": null
          }
        ]
      },
      {
        "q": "Build the cumulative distribution values $F(x)=P(X\\leq x)$ for $X=1,2,3$ using:<br><br>$\\begin{array}{c|ccc}x&1&2&3\\\\hline P(X=x)&0.2&0.5&0.3\\end{array}$",
        "steps": [
          {
            "text": "At $x=1$: $F(1)=P(X\\leq1)=0.2$.",
            "micro": {
              "title": "CDF table process",
              "body": "Move left to right. Each cumulative value equals the previous cumulative value plus the new probability."
            }
          },
          {
            "text": "At $x=2$: $F(2)=P(X\\leq2)=0.2+0.5=0.7$.",
            "micro": null
          },
          {
            "text": "At $x=3$: $F(3)=P(X\\leq3)=0.2+0.5+0.3=1.0$.<br><strong>Answer:</strong> $F(1)=0.2$, $F(2)=0.7$, $F(3)=1$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A cumulative distribution is given by $F(1)=0.15$, $F(2)=0.55$, $F(3)=0.80$, $F(4)=1$. Find $P(X=3)$.",
        "steps": [
          {
            "text": "For a discrete variable, $P(X=3)=F(3)-F(2)$.",
            "micro": {
              "title": "Recovering a probability from a CDF",
              "body": "$F(3)$ includes everything up to 3. $F(2)$ includes everything before 3. Subtracting leaves only the probability at 3."
            }
          },
          {
            "text": "$P(X=3)=0.80-0.55=0.25$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $P(X=3)=0.25$.",
            "micro": null
          }
        ]
      },
      {
        "q": "For $X$ with $E(X)=6$ and $\\operatorname{Var}(X)=9$, let $Y=\\frac{X-6}{3}$. Find $E(Y)$ and $\\operatorname{Var}(Y)$.",
        "steps": [
          {
            "text": "Rewrite $Y=\\frac13X-2$.",
            "micro": {
              "title": "Put it in $aX+b$ form",
              "body": "The transformation rules are easiest when you can clearly see the multiplier $a$ and shift $b$."
            }
          },
          {
            "text": "$E(Y)=\\frac13E(X)-2=\\frac13(6)-2=0$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(Y)=\\left(\\frac13\\right)^2\\operatorname{Var}(X)=\\frac19(9)=1$.<br><strong>Answer:</strong> $E(Y)=0$, $\\operatorname{Var}(Y)=1$.",
            "micro": {
              "title": "Standardising idea",
              "body": "This is the discrete-variable version of standardising: subtract the mean and divide by the standard deviation to get mean $0$ and variance $1$."
            }
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "The cumulative distribution of $X$ is $F(0)=0.1$, $F(1)=0.4$, $F(2)=0.75$, $F(3)=1$. Find the probability function and then $E(X)$.",
        "steps": [
          {
            "text": "Recover individual probabilities by subtracting consecutive cumulative values.",
            "micro": {
              "title": "CDF to PDF table",
              "body": "For discrete random variables, the probability at a point is the jump in the cumulative distribution at that point."
            }
          },
          {
            "text": "$P(X=0)=0.1$, $P(X=1)=0.4-0.1=0.3$, $P(X=2)=0.75-0.4=0.35$, $P(X=3)=1-0.75=0.25$.",
            "micro": null
          },
          {
            "text": "Now find $E(X)=0(0.1)+1(0.3)+2(0.35)+3(0.25)=0+0.3+0.7+0.75=1.75$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $\\begin{array}{c|cccc}x&0&1&2&3\\\\hline P(X=x)&0.1&0.3&0.35&0.25\\end{array}$ and $E(X)=1.75$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A random variable has $P(X=x)=\\frac{x+1}{k}$ for $x=0,1,2,3$. Find $k$, then find $P(X\\geq2\\mid X\\leq3)$.",
        "steps": [
          {
            "text": "Find $k$ using total probability: $\\frac{1+2+3+4}{k}=1$.",
            "micro": {
              "title": "Conditional probability still starts with the distribution",
              "body": "Before doing the conditional probability, make sure the probability rule is fully known."
            }
          },
          {
            "text": "$\\frac{10}{k}=1 \\Rightarrow k=10$.",
            "micro": null
          },
          {
            "text": "Since $X$ only takes values $0,1,2,3$, the condition $X\\leq3$ is certain. So $P(X\\geq2\\mid X\\leq3)=P(X\\geq2)$.",
            "micro": {
              "title": "Check the condition",
              "body": "Sometimes the condition does not reduce the sample space at all. Here every possible value is already $\\leq3$."
            }
          },
          {
            "text": "$P(X\\geq2)=P(X=2)+P(X=3)=\\frac3{10}+\\frac4{10}=\\frac7{10}$.<br><strong>Answer:</strong> $k=10$, conditional probability $=\\frac7{10}$.",
            "micro": null
          }
        ]
      }
    ]
  },
  "binomial": {
    "easy": [
      {
        "q": "A single trial has probability of success $p=0.3$. Let $X$ be the Bernoulli random variable for success. State $E(X)$ and $\\operatorname{Var}(X)$.",
        "steps": [
          {
            "text": "For a Bernoulli random variable, $E(X)=p$.",
            "micro": {
              "title": "Bernoulli variable",
              "body": "A Bernoulli random variable records one trial: $X=1$ for success and $X=0$ for failure."
            }
          },
          {
            "text": "So $E(X)=0.3$.",
            "micro": null
          },
          {
            "text": "For Bernoulli, $\\operatorname{Var}(X)=p(1-p)=0.3(0.7)=0.21$.<br><strong>Answer:</strong> $E(X)=0.3$, $\\operatorname{Var}(X)=0.21$.",
            "micro": null
          }
        ]
      },
      {
        "q": "Let $X\\sim B(5,0.2)$. Find $P(X=2)$.",
        "steps": [
          {
            "text": "Use the binomial formula $P(X=x)=\\binom{n}{x}p^x(1-p)^{n-x}$.",
            "micro": {
              "title": "When binomial applies",
              "body": "Binomial means fixed number of trials, independent trials, two outcomes, and constant probability of success."
            }
          },
          {
            "text": "Here $n=5$, $p=0.2$, and $x=2$: $P(X=2)=\\binom52(0.2)^2(0.8)^3$.",
            "micro": null
          },
          {
            "text": "$=10(0.04)(0.512)=0.2048$.<br><strong>Answer:</strong> $P(X=2)=0.2048$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "Let $X\\sim B(8,0.25)$. Find $P(X\\geq1)$.",
        "steps": [
          {
            "text": "Use the complement: $P(X\\geq1)=1-P(X=0)$.",
            "micro": {
              "title": "At least one shortcut",
              "body": "For binomial questions, 'at least one' is usually fastest by complement: $1-$ probability of none."
            }
          },
          {
            "text": "$P(X=0)=\\binom80(0.25)^0(0.75)^8=(0.75)^8$.",
            "micro": null
          },
          {
            "text": "So $P(X\\geq1)=1-(0.75)^8\\approx0.8999$.<br><strong>Answer:</strong> approximately $0.900$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A multiple-choice quiz has 10 questions, each with 4 options. A student guesses every answer. Let $X$ be the number correct. State the distribution and find $E(X)$ and $\\operatorname{Var}(X)$.",
        "steps": [
          {
            "text": "Each question has probability of success $p=\\frac14$, with $n=10$ independent trials.",
            "micro": {
              "title": "Identifying binomial parameters",
              "body": "Correct/incorrect gives two outcomes, $n$ is fixed, and guessing keeps the probability constant for each question."
            }
          },
          {
            "text": "So $X\\sim B\\left(10,\\frac14\\right)$.",
            "micro": null
          },
          {
            "text": "$E(X)=np=10\\left(\\frac14\\right)=2.5$.",
            "micro": null
          },
          {
            "text": "$\\operatorname{Var}(X)=np(1-p)=10\\left(\\frac14\\right)\\left(\\frac34\\right)=\\frac{30}{16}=1.875$.<br><strong>Answer:</strong> $X\\sim B(10,\\frac14)$, $E(X)=2.5$, $\\operatorname{Var}(X)=1.875$.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A binomial random variable has mean $4.8$ and variance $3.36$. Find $n$ and $p$.",
        "steps": [
          {
            "text": "For $X\\sim B(n,p)$, mean $np=4.8$ and variance $np(1-p)=3.36$.",
            "micro": {
              "title": "Reverse binomial problem",
              "body": "Use the mean and variance formulas together. Dividing them is often the cleanest way to eliminate $n$."
            }
          },
          {
            "text": "Divide variance by mean: $\\frac{np(1-p)}{np}=1-p=\\frac{3.36}{4.8}=0.7$.",
            "micro": null
          },
          {
            "text": "So $p=0.3$.",
            "micro": null
          },
          {
            "text": "Use $np=4.8$: $n(0.3)=4.8 \\Rightarrow n=16$.<br><strong>Answer:</strong> $n=16$, $p=0.3$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A machine produces defective items with probability $0.04$. Find the smallest number of items that must be inspected so the probability of finding at least one defective item is greater than $0.5$.",
        "steps": [
          {
            "text": "Let $X\\sim B(n,0.04)$ be the number of defective items. We need $P(X\\geq1)>0.5$.",
            "micro": {
              "title": "Smallest-n binomial structure",
              "body": "When the question asks for the smallest number of trials for 'at least one', use the complement and solve an inequality."
            }
          },
          {
            "text": "Use complement: $P(X\\geq1)=1-P(X=0)=1-(0.96)^n$.",
            "micro": null
          },
          {
            "text": "Solve $1-(0.96)^n>0.5 \\Rightarrow (0.96)^n<0.5$.",
            "micro": null
          },
          {
            "text": "Taking logs: $n\\ln(0.96)<\\ln(0.5)$. Since $\\ln(0.96)<0$, dividing reverses the inequality: $n>\\frac{\\ln(0.5)}{\\ln(0.96)}\\approx16.98$.",
            "micro": {
              "title": "Inequality sign with logs",
              "body": "Dividing by a negative number reverses the inequality. This matters because $\\ln(0.96)$ is negative."
            }
          },
          {
            "text": "The smallest whole number is $n=17$.<br><strong>Answer:</strong> inspect at least $17$ items.",
            "micro": null
          }
        ]
      }
    ]
  }
};

function renderRTier(topic, tier) {
  const container = document.getElementById('rtier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (RBANK[topic] && RBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: 'RV Easy', medium: 'RV Medium', hard: 'RV Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];

  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;

  questions.forEach((qd, qi) => {
    const cardId = `r-${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header">
        <span class="q-number">Q${qi+1}</span>
        <div class="q-text">${protectMathHTML(qd.q)}</div>
      </div>
      <div class="q-actions">
        <button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button>
      </div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div>
        <div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span>
          <span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) {
        html += `<span class="exp-step-hint-tag">stuck?</span>`;
      }
      html += `<span class="exp-step-chevron">▶</span>
        </div>`;
      if (step.micro) {
        html += `<div class="exp-step-micro">
          <div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div>
          <div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div>
        </div>`;
      }
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

function initDRVBank() {
  ['probfunc','expectation','variance','cdftrans','binomial'].forEach(topic => {
    renderRTier(topic, 'easy');
    renderRTier(topic, 'medium');
    renderRTier(topic, 'hard');
  });
}



// ═══════════════════════════════════════════════════
// LOGARITHMIC FUNCTIONS PAGE — topic/tier navigation + question bank
// ═══════════════════════════════════════════════════
function selectLTopic(topic) {
  document.querySelectorAll('.ltopic-content-block').forEach(b => b.classList.remove('active'));
  document.getElementById('ltopic-' + topic).classList.add('active');
  document.querySelectorAll('.topic-pill-card[data-ltopic]').forEach(c => c.classList.toggle('active', c.dataset.ltopic === topic));
  document.querySelectorAll('.sidebar-item[data-ltopic]').forEach(c => c.classList.toggle('active', c.dataset.ltopic === topic));
  renderLTier(topic, 'easy');
  renderLTier(topic, 'medium');
  renderLTier(topic, 'hard');
  rerenderMath(document.getElementById('ltopic-' + topic));
}

function selectLTier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('ltier-' + topic + '-' + tier).classList.add('active');
}

const LBANK = {
  basics: {
    easy: [
      { q: "Evaluate $\\log_2 32$.",
        steps: [
          { text: "Ask: $2$ to what power equals $32$?", micro: { title: "What a logarithm means", body: "$\\log_a b=c$ means exactly the same thing as $a^c=b$. A logarithm is an exponent question." } },
          { text: "Since $2^5=32$, we have $\\log_2 32=5$.", micro: null },
          { text: "<strong>Answer:</strong> $5$", micro: null }
        ] },
      { q: "Write $3^4=81$ in logarithmic form.",
        steps: [
          { text: "Identify the base, exponent, and result: base $3$, exponent $4$, result $81$.", micro: { title: "Index form to log form", body: "$a^c=b$ becomes $\\log_a b=c$. The base stays the base; the exponent becomes the answer to the log." } },
          { text: "Convert: $3^4=81 \\Rightarrow \\log_3 81=4$.", micro: null },
          { text: "<strong>Answer:</strong> $\\log_3 81=4$", micro: null }
        ] }
    ],
    medium: [
      { q: "Simplify $\\log_2 8 + \\log_2 4 - \\log_2 16$.",
        steps: [
          { text: "Evaluate each log exactly: $\\log_2 8=3$, $\\log_2 4=2$, and $\\log_2 16=4$.", micro: { title: "Use powers of the base", body: "When the base is $2$, rewrite each number as a power of $2$: $8=2^3$, $4=2^2$, $16=2^4$." } },
          { text: "Substitute: $3+2-4=1$.", micro: null },
          { text: "<strong>Answer:</strong> $1$", micro: null }
        ] },
      { q: "Use log laws to write $2\\log_a x-\\log_a y$ as a single logarithm.",
        steps: [
          { text: "Use the power law first: $2\\log_a x=\\log_a(x^2)$.", micro: { title: "Power law", body: "$k\\log_a M=\\log_a(M^k)$. The coefficient becomes a power inside the log." } },
          { text: "Use the quotient law: $\\log_a(x^2)-\\log_a y=\\log_a\\left(\\dfrac{x^2}{y}\\right)$.", micro: { title: "Subtraction becomes division", body: "Logs with the same base combine as $\\log_a M-\\log_a N=\\log_a(M/N)$. This only works when the bases match." } },
          { text: "<strong>Answer:</strong> $\\log_a\\left(\\dfrac{x^2}{y}\\right)$", micro: null }
        ] }
    ],
    hard: [
      { q: "Given $p=\\log_2 3$, express $\\log_2 72$ in terms of $p$.",
        steps: [
          { text: "Factor $72$ using powers of $2$ and $3$: $72=8\\times 9=2^3\\times 3^2$.", micro: { title: "Prime factor first", body: "Hard log-law questions usually become simple after factorising the number into known bases. Here the known unknown is $\\log_2 3$, so we want powers of $3$ and $2$." } },
          { text: "$\\log_2 72=\\log_2(2^3\\times 3^2)$.", micro: null },
          { text: "Use product and power laws: $\\log_2(2^3)+\\log_2(3^2)=3+2\\log_2 3$.", micro: { title: "Why $\\log_2(2^3)=3$", body: "A log asks for the exponent. Since $2^3$ already has base $2$, $\\log_2(2^3)=3$." } },
          { text: "Since $p=\\log_2 3$, <strong>answer:</strong> $3+2p$.", micro: null }
        ] }
    ]
  },

  equations: {
    easy: [
      { q: "Solve $\\log_3 x=4$.",
        steps: [
          { text: "Convert to index form: $\\log_3 x=4 \\Rightarrow 3^4=x$.", micro: { title: "Log equation strategy", body: "When a log equals a number, convert to exponential form. This removes the log in one step." } },
          { text: "$3^4=81$, so $x=81$.", micro: null },
          { text: "<strong>Answer:</strong> $x=81$", micro: null }
        ] },
      { q: "Solve $\\log_5(x-2)=2$.",
        steps: [
          { text: "Convert to index form: $x-2=5^2$.", micro: { title: "The whole argument equals the power", body: "The log's argument is everything inside the brackets. So $x-2$, not just $x$, equals $5^2$." } },
          { text: "$x-2=25 \\Rightarrow x=27$.", micro: null },
          { text: "Check the domain: $x-2>0$, and $27-2=25>0$, so the solution is valid.<br><strong>Answer:</strong> $x=27$", micro: { title: "Always check log domains", body: "Logarithms only accept positive arguments. Any solution that makes the inside of a log zero or negative must be rejected." } }
        ] }
    ],
    medium: [
      { q: "Solve $\\log_2 x+\\log_2(x-2)=3$.",
        steps: [
          { text: "Combine the logs using the product law: $\\log_2[x(x-2)]=3$.", micro: { title: "Before converting", body: "When there is more than one log with the same base, combine them first if possible. This turns the equation into one log equals one number." } },
          { text: "Convert to index form: $x(x-2)=2^3=8$.", micro: null },
          { text: "Solve the quadratic: $x^2-2x-8=0 \\Rightarrow (x-4)(x+2)=0$, so $x=4$ or $x=-2$.", micro: null },
          { text: "Check the domain: $x>0$ and $x-2>0$, so $x>2$. Reject $x=-2$.<br><strong>Answer:</strong> $x=4$", micro: { title: "Domain removes extraneous roots", body: "The algebra may produce values that do not work in the original logarithms. Substitute into the original arguments to check positivity." } }
        ] },
      { q: "Solve $2^x=13$ exactly in logarithmic form.",
        steps: [
          { text: "Take logs of both sides: $\\log(2^x)=\\log(13)$.", micro: { title: "Any consistent log base works", body: "You can use $\\ln$ or common log. The base does not matter as long as you use the same base on both sides." } },
          { text: "Use the power law: $x\\log 2=\\log 13$.", micro: null },
          { text: "Divide by $\\log 2$: <strong>Answer:</strong> $x=\\dfrac{\\log 13}{\\log 2}$.", micro: { title: "Change of base", body: "This is the change-of-base idea: $\\log_2 13=\\frac{\\log 13}{\\log 2}$." } }
        ] }
    ],
    hard: [
      { q: "Solve $\\log_3(x+1)+\\log_3(x-1)=2$ and justify any rejected solutions.",
        steps: [
          { text: "State the domain first: $x+1>0$ and $x-1>0$, so $x>1$.", micro: { title: "Start with the domain", body: "For equations with several logs, the domain is often the easiest way to avoid keeping invalid roots later." } },
          { text: "Combine: $\\log_3[(x+1)(x-1)]=2$.", micro: null },
          { text: "Convert: $(x+1)(x-1)=3^2=9$.", micro: null },
          { text: "Solve: $x^2-1=9 \\Rightarrow x^2=10 \\Rightarrow x=\\pm\\sqrt{10}$.", micro: null },
          { text: "Use the domain $x>1$: reject $-\\sqrt{10}$.<br><strong>Answer:</strong> $x=\\sqrt{10}$", micro: { title: "Justifying rejection", body: "$-\\sqrt{10}-1<0$, so $\\log_3(x-1)$ would be undefined. This is a mathematical reason, not just a preference." } }
        ] }
    ]
  },

  graphs: {
    easy: [
      { q: "State the domain, vertical asymptote, and x-intercept of $y=\\log_2 x$.",
        steps: [
          { text: "For $y=\\log_2 x$, the argument must be positive, so the domain is $x>0$.", micro: { title: "Why $x>0$", body: "A logarithm is only defined for positive inputs. That is why the graph never crosses or touches the y-axis." } },
          { text: "The vertical asymptote is $x=0$.", micro: null },
          { text: "The x-intercept occurs when $y=0$: $\\log_2 x=0 \\Rightarrow x=2^0=1$.<br><strong>Answer:</strong> domain $x>0$, asymptote $x=0$, x-intercept $(1,0)$", micro: null }
        ] },
      { q: "For $y=\\log_3(x-4)$, state the domain and vertical asymptote.",
        steps: [
          { text: "The argument must be positive: $x-4>0$.", micro: { title: "Shifted log domain", body: "For $\\log_a(x-h)$, the graph shifts right by $h$, and the domain becomes $x>h$." } },
          { text: "So $x>4$, and the vertical asymptote is where the argument is zero: $x=4$.", micro: null },
          { text: "<strong>Answer:</strong> domain $x>4$, vertical asymptote $x=4$", micro: null }
        ] }
    ],
    medium: [
      { q: "Describe the transformations from $y=\\log_2 x$ to $y=\\log_2(x-3)+5$.",
        steps: [
          { text: "Inside the log, $x-3$ means a horizontal shift right by $3$.", micro: { title: "Inside changes are horizontal", body: "A change inside the function affects the x-values. $f(x-3)$ shifts the graph right by $3$, even though the sign looks negative." } },
          { text: "Outside the log, $+5$ means a vertical shift up by $5$.", micro: null },
          { text: "<strong>Answer:</strong> translate $3$ units right and $5$ units up. The vertical asymptote moves from $x=0$ to $x=3$.", micro: { title: "Asymptote follows the horizontal shift", body: "The asymptote occurs where the log argument is zero. For $x-3$, that is $x=3$." } }
        ] },
      { q: "Find the x-intercept of $y=\\log_2(x+1)-3$.",
        steps: [
          { text: "Set $y=0$: $\\log_2(x+1)-3=0$.", micro: null },
          { text: "$\\log_2(x+1)=3$.", micro: null },
          { text: "Convert to index form: $x+1=2^3=8$, so $x=7$.", micro: { title: "Intercept means y = 0", body: "An x-intercept is where the graph crosses the x-axis, so the y-value is zero. Substitute $y=0$ before solving." } },
          { text: "<strong>Answer:</strong> $(7,0)$", micro: null }
        ] }
    ],
    hard: [
      { q: "A logarithmic graph has equation $y=\\log_2(x-a)+b$. Its vertical asymptote is $x=3$ and it passes through $(7,5)$. Find $a$ and $b$.",
        steps: [
          { text: "The vertical asymptote occurs when $x-a=0$, so $x=a$.", micro: { title: "Using the asymptote", body: "For $\\log_2(x-a)$, the graph cannot pass the line $x=a$. That line is the vertical asymptote." } },
          { text: "Since the asymptote is $x=3$, we get $a=3$.", micro: null },
          { text: "Substitute the point $(7,5)$ into $y=\\log_2(x-3)+b$: $5=\\log_2(7-3)+b$.", micro: null },
          { text: "$5=\\log_2 4+b=2+b$, so $b=3$.", micro: { title: "Exact log value", body: "$\\log_2 4=2$ because $2^2=4$." } },
          { text: "<strong>Answer:</strong> $a=3$, $b=3$", micro: null }
        ] }
    ]
  },

  modelling: {
    easy: [
      { q: "A sound level is given by $L=10\\log_{10}(I/I_0)$. If $I=100I_0$, find $L$.",
        steps: [
          { text: "Substitute $I/I_0=100$ into the formula: $L=10\\log_{10}(100)$.", micro: { title: "Use the ratio", body: "The formula depends on $I/I_0$, not on $I$ alone. Here the ratio is exactly $100$." } },
          { text: "$\\log_{10}(100)=2$ because $10^2=100$.", micro: null },
          { text: "So $L=10(2)=20$.<br><strong>Answer:</strong> $20$ dB", micro: null }
        ] },
      { q: "The pH of a solution is $pH=-\\log_{10}[H^+]$. Find the pH if $[H^+]=10^{-4}$.",
        steps: [
          { text: "Substitute: $pH=-\\log_{10}(10^{-4})$.", micro: { title: "Log of a power of 10", body: "$\\log_{10}(10^k)=k$. The logarithm returns the exponent." } },
          { text: "$\\log_{10}(10^{-4})=-4$, so $pH=-(-4)=4$.", micro: null },
          { text: "<strong>Answer:</strong> $4$", micro: null }
        ] }
    ],
    medium: [
      { q: "A population model is $P(t)=500e^{0.08t}$. Find the time when the population reaches $1000$, giving an exact expression.",
        steps: [
          { text: "Set $P(t)=1000$: $1000=500e^{0.08t}$.", micro: null },
          { text: "Divide by $500$: $2=e^{0.08t}$.", micro: { title: "Isolate the exponential first", body: "Before taking logs, get the exponential expression by itself. This prevents common errors like taking $\\ln$ of only part of a product." } },
          { text: "Take natural logs: $\\ln 2=0.08t$.", micro: { title: "Why natural log", body: "Natural log is the inverse of $e^x$. If the base is $e$, use $\\ln$ to undo it." } },
          { text: "<strong>Answer:</strong> $t=\\dfrac{\\ln 2}{0.08}=12.5\\ln 2$", micro: null }
        ] },
      { q: "The magnitude difference between two stars is $m_1-m_2=-2.5\\log_{10}(B_1/B_2)$. If $B_1/B_2=100$, find $m_1-m_2$.",
        steps: [
          { text: "Substitute the brightness ratio: $m_1-m_2=-2.5\\log_{10}(100)$.", micro: null },
          { text: "$\\log_{10}(100)=2$.", micro: null },
          { text: "So $m_1-m_2=-2.5(2)=-5$.<br><strong>Answer:</strong> $-5$", micro: { title: "Interpreting the sign", body: "In this scale, a more negative magnitude means brighter. The sign is part of the model, not an arithmetic mistake." } }
        ] }
    ],
    hard: [
      { q: "An exponential model has the form $N(t)=Ae^{kt}$. Initially $N(0)=80$, and after 5 hours $N(5)=200$. Find $A$ and $k$, then write the model.",
        steps: [
          { text: "Use $N(0)=80$: $80=Ae^{0}=A$, so $A=80$.", micro: { title: "Initial value", body: "In $Ae^{kt}$, setting $t=0$ gives $Ae^0=A$. That is why $A$ is the starting amount." } },
          { text: "Use $N(5)=200$: $200=80e^{5k}$.", micro: null },
          { text: "Divide by $80$: $e^{5k}=\\dfrac{200}{80}=\\dfrac52$.", micro: null },
          { text: "Take natural logs: $5k=\\ln\\left(\\dfrac52\\right)$, so $k=\\dfrac{1}{5}\\ln\\left(\\dfrac52\\right)$.", micro: { title: "Solving for k", body: "Once the exponential is isolated, $\\ln$ turns the exponent into an ordinary multiplier: $\\ln(e^{5k})=5k$." } },
          { text: "<strong>Answer:</strong> $N(t)=80e^{\\left(\\frac15\\ln(5/2)\\right)t}$", micro: null }
        ] }
    ]
  },

  lncalc: {
    easy: [
      { q: "Differentiate $f(x)=\\ln x$.",
        steps: [
          { text: "Use the standard result: $\\dfrac{d}{dx}(\\ln x)=\\dfrac{1}{x}$.", micro: { title: "Core natural log derivative", body: "This is a Unit 4 result that becomes as important as $\\frac{d}{dx}(e^x)=e^x$. Memorise it." } },
          { text: "<strong>Answer:</strong> $f'(x)=\\dfrac{1}{x}$", micro: null }
        ] },
      { q: "Evaluate $\\displaystyle\\int_1^e \\frac{1}{x}\,dx$.",
        steps: [
          { text: "Use $\\int \\frac{1}{x}\,dx=\\ln|x|+c$.", micro: { title: "The missing power-rule case", body: "$1/x=x^{-1}$ is the one power where the usual power rule does not work. Its antiderivative is $\\ln|x|$." } },
          { text: "Evaluate: $[\\ln x]_1^e=\\ln e-\\ln 1$.", micro: null },
          { text: "$\\ln e=1$ and $\\ln 1=0$, so the value is $1$.<br><strong>Answer:</strong> $1$", micro: null }
        ] }
    ],
    medium: [
      { q: "Differentiate $f(x)=\\ln(3x+2)$.",
        steps: [
          { text: "Use the chain rule for $\\ln(g(x))$: $\\dfrac{d}{dx}\\ln(g(x))=\\dfrac{g'(x)}{g(x)}$.", micro: { title: "Log chain rule", body: "Differentiate the inside and put it over the original inside. This is the fastest way to differentiate $\\ln$ of a function." } },
          { text: "Here $g(x)=3x+2$, so $g'(x)=3$.", micro: null },
          { text: "<strong>Answer:</strong> $f'(x)=\\dfrac{3}{3x+2}$", micro: null }
        ] },
      { q: "Find $\\displaystyle\\int \\frac{2x}{x^2+5}\,dx$.",
        steps: [
          { text: "Notice the numerator $2x$ is the derivative of the denominator $x^2+5$.", micro: { title: "Recognising $f'/f$", body: "An integral of the form $\\int \\frac{f'(x)}{f(x)}dx$ becomes $\\ln|f(x)|+c$." } },
          { text: "So this matches $\\int \\dfrac{f'(x)}{f(x)}dx$ with $f(x)=x^2+5$.", micro: null },
          { text: "<strong>Answer:</strong> $\\ln(x^2+5)+c$", micro: { title: "Absolute value?", body: "Strictly, $\\ln|x^2+5|+c$. Since $x^2+5$ is always positive, $\\ln(x^2+5)+c$ is fine here." } }
        ] }
    ],
    hard: [
      { q: "Determine $\\dfrac{d}{dx}(x^2\\ln x)$, hence find $\\displaystyle\\int 2x\\ln x\,dx$.",
        steps: [
          { text: "Differentiate $x^2\\ln x$ using the product rule: $u=x^2$, $v=\\ln x$.", micro: { title: "Why product rule", body: "$x^2\\ln x$ is a product of two functions of $x$, so use $u'v+uv'$." } },
          { text: "$u'=2x$ and $v'=1/x$.", micro: null },
          { text: "$\\dfrac{d}{dx}(x^2\\ln x)=2x\\ln x+x^2\\cdot\\dfrac1x=2x\\ln x+x$.", micro: null },
          { text: "Rearrange to isolate the integrand: $2x\\ln x=\\dfrac{d}{dx}(x^2\\ln x)-x$.", micro: { title: "The 'hence' move", body: "A hence integral often asks you to rearrange a derivative result, not to invent a new integration technique." } },
          { text: "Integrate both sides: $\\int 2x\\ln x\,dx=x^2\\ln x-\\int x\,dx=x^2\\ln x-\\dfrac{x^2}{2}+c$.<br><strong>Answer:</strong> $x^2\\ln x-\\dfrac{x^2}{2}+c$", micro: null }
        ] }
    ]
  }
};

function renderLTier(topic, tier) {
  const container = document.getElementById('ltier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (LBANK[topic] && LBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: 'log Easy', medium: 'log Medium', hard: 'log Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];

  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;

  questions.forEach((qd, qi) => {
    const cardId = `l-${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header">
        <span class="q-number">Q${qi+1}</span>
        <div class="q-text">${protectMathHTML(qd.q)}</div>
      </div>
      <div class="q-actions">
        <button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button>
      </div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div>
        <div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span>
          <span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) html += `<span class="exp-step-hint-tag">stuck?</span>`;
      html += `<span class="exp-step-chevron">▶</span>
        </div>`;
      if (step.micro) {
        html += `<div class="exp-step-micro">
          <div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div>
          <div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div>
        </div>`;
      }
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

function initLogBank() {
  ['basics','equations','graphs','modelling','lncalc'].forEach(topic => {
    renderLTier(topic, 'easy');
    renderLTier(topic, 'medium');
    renderLTier(topic, 'hard');
  });
}

// ═══════════════════════════════════════════════════
// HERO CANVAS ANIMATION
// ═══════════════════════════════════════════════════
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const W = canvas.width, H = canvas.height;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Floating integral curve
    ctx.save();
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) * 0.35;

    // Draw an integral-shaped curve that animates
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.15)';
    ctx.lineWidth = 1;

    for (let j = 0; j < 3; j++) {
      const offset = j * 80 - 80;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const px = (i / 200) * W;
        const wave = Math.sin(px * 0.008 + t * 0.4 + j * 1.2) * 30 +
                     Math.sin(px * 0.012 - t * 0.3 + j) * 20;
        const py = cy + wave + offset;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Floating dots
    ctx.fillStyle = 'rgba(108, 99, 255, 0.2)';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + t * 0.1;
      const r = 200 + Math.sin(t * 0.2 + i) * 40;
      const dx = cx + Math.cos(angle) * r;
      const dy = cy + Math.sin(angle) * r * 0.4;
      ctx.beginPath();
      ctx.arc(dx, dy, 2 + Math.sin(t * 0.3 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    t += 0.016;
    requestAnimationFrame(draw);
  }
  draw();
}


// ═══════════════════════════════════════════════════
// CONTINUOUS RANDOM VARIABLES PAGE — topic/tier navigation + question bank
// ═══════════════════════════════════════════════════
function selectCTopic(topic) {
  const targetBlock = document.getElementById('ctopic-' + topic);
  if (!targetBlock) return;

  // Match the Integration page behaviour: only one subtopic is visible at a time.
  document.querySelectorAll('.ctopic-content-block').forEach(b => b.classList.remove('active'));
  targetBlock.classList.add('active');

  document.querySelectorAll('.topic-pill-card[data-ctopic]').forEach(c => c.classList.toggle('active', c.dataset.ctopic === topic));
  document.querySelectorAll('.sidebar-item[data-ctopic]').forEach(c => c.classList.toggle('active', c.dataset.ctopic === topic));

  renderCRVTier(topic, 'easy');
  renderCRVTier(topic, 'medium');
  renderCRVTier(topic, 'hard');

  // Important fix: when changing CRV subtopics, reset the difficulty view to Easy.
  // Without this, the new subtopic could be active but have no visible tier selected,
  // which made Uniform/CDF/Mean/Transform appear blank.
  targetBlock.querySelectorAll('.diff-tab').forEach(tab => tab.classList.remove('active'));
  const easyTab = targetBlock.querySelector('.diff-tab');
  if (easyTab) easyTab.classList.add('active');

  targetBlock.querySelectorAll('.tier-block').forEach(block => block.classList.remove('active'));
  const easyTier = document.getElementById('ctier-' + topic + '-easy');
  if (easyTier) easyTier.classList.add('active');

  rerenderMath(targetBlock);

  // Keep the selected subtopic visible when the user has scrolled down in another CRV topic.
  const header = document.querySelector('#page-crv .module-header');
  if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectCTier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('ctier-' + topic + '-' + tier).classList.add('active');
}

const CRVBANK = {
  pdf: {
    easy: [
      { q: "Let $X$ have PDF $f(x)=\\dfrac{x}{8}$ for $0\\le x\\le4$. Find $P(1<X<3)$.",
        steps: [
          { text: "For a continuous random variable, probability is area under the density curve: $P(1<X<3)=\\displaystyle\\int_1^3 \\dfrac{x}{8}\\,dx$.", micro: { title: "PDF means density, not direct probability", body: "For continuous variables, $P(X=2)=0$. We only get non-zero probabilities over intervals by integrating the PDF." } },
          { text: "Integrate: $\\displaystyle\\int_1^3 \\dfrac{x}{8}\\,dx=\\left[\\dfrac{x^2}{16}\\right]_1^3$.", micro: null },
          { text: "Evaluate: $\\dfrac{9}{16}-\\dfrac{1}{16}=\\dfrac{8}{16}=\\dfrac12$.<br><strong>Answer:</strong> $P(1<X<3)=\\dfrac12$.", micro: null }
        ] },
      { q: "For $f(x)=kx$ on $0\\le x\\le 5$, find $k$ so that $f$ is a valid PDF.",
        steps: [
          { text: "A valid PDF must have total area 1, so set $\\displaystyle\\int_0^5 kx\\,dx=1$.", micro: { title: "The normalising condition", body: "All probability must add up to 1. For a continuous variable this means the total area under the PDF over its support is 1." } },
          { text: "$\\displaystyle\\int_0^5 kx\\,dx=k\\left[\\dfrac{x^2}{2}\\right]_0^5=\\dfrac{25k}{2}$.", micro: null },
          { text: "Solve $\\dfrac{25k}{2}=1$, giving <strong>$k=\\dfrac{2}{25}$</strong>.", micro: null }
        ] }
    ],
    medium: [
      { q: "A random variable has PDF $f(x)=k(x+1)$ for $0\\le x\\le2$. Find $k$, then find $P(X>1)$.",
        steps: [
          { text: "First use total area 1: $\\displaystyle\\int_0^2 k(x+1)\\,dx=1$.", micro: { title: "Why find k first?", body: "You cannot calculate any probabilities until the density is normalised. The constant $k$ controls the total area under the curve." } },
          { text: "$k\\left[\\dfrac{x^2}{2}+x\\right]_0^2=k(2+2)=4k=1$, so $k=\\dfrac14$.", micro: null },
          { text: "Now $P(X>1)=\\displaystyle\\int_1^2 \\dfrac14(x+1)\\,dx=\\dfrac14\\left[\\dfrac{x^2}{2}+x\\right]_1^2$.", micro: null },
          { text: "$=\\dfrac14\\left(4-\\dfrac32\\right)=\\dfrac14\\cdot\\dfrac52=\\dfrac58$.<br><strong>Answer:</strong> $k=\\dfrac14$, $P(X>1)=\\dfrac58$.", micro: null }
        ] },
      { q: "Suppose $f(x)=\\dfrac{3}{64}x^2$ for $0\\le x\\le4$. Find $P(2<X<4)$.",
        steps: [
          { text: "Set up the probability integral over the requested interval: $P(2<X<4)=\\displaystyle\\int_2^4 \\dfrac{3}{64}x^2\\,dx$.",
            micro: { title: "Use the support and the event", body: "The support tells you where the PDF exists. The event $2<X<4$ tells you the exact limits to integrate between." } },
          { text: "Integrate: $\\displaystyle\\int \\dfrac{3}{64}x^2\\,dx=\\dfrac{x^3}{64}$.",
            micro: { title: "Power rule inside probability", body: "The probability calculation is still an integral. Here $\\int x^2dx=\\frac{x^3}{3}$, and the factor $\\frac{3}{64}$ leaves $\\frac{x^3}{64}$." } },
          { text: "Evaluate:<br>$\\left[\\dfrac{x^3}{64}\\right]_2^4=\\dfrac{64}{64}-\\dfrac{8}{64}=1-\\dfrac18=\\dfrac78$.",
            micro: { title: "Reasonableness check", body: "The answer is between $0$ and $1$, as every probability must be. It is large because the density increases with $x^2$, so more mass is near the right end." } },
          { text: "<strong>Answer:</strong> $P(2<X<4)=\\dfrac78$.",
            micro: { title: "Endpoint note", body: "For continuous variables, $P(2<X<4)$ equals $P(2\\le X\\le4)$ because exact endpoint probabilities are zero." } }
        ] },
    ],
    hard: [
      { q: "A PDF is given by $f(x)=kx(4-x)$ for $0\\le x\\le4$. Find $k$ and hence find $P(1<X<3)$ exactly.",
        steps: [
          { text: "Use total area 1: $\\displaystyle\\int_0^4 kx(4-x)\\,dx=1$.", micro: { title: "Quadratic density shape", body: "$x(4-x)$ is non-negative on $[0,4]$, so it can be a PDF shape once multiplied by the correct $k$." } },
          { text: "$\\displaystyle\\int_0^4 (4x-x^2)\\,dx=\\left[2x^2-\\dfrac{x^3}{3}\\right]_0^4=32-\\dfrac{64}{3}=\\dfrac{32}{3}$, so $k=\\dfrac{3}{32}$.", micro: null },
          { text: "Now $P(1<X<3)=\\displaystyle\\int_1^3 \\dfrac{3}{32}x(4-x)\\,dx$.", micro: null },
          { text: "$=\\dfrac{3}{32}\\left[2x^2-\\dfrac{x^3}{3}\\right]_1^3=\\dfrac{3}{32}\\left(9-\\dfrac53\\right)=\\dfrac{3}{32}\\cdot\\dfrac{22}{3}=\\dfrac{11}{16}$.<br><strong>Answer:</strong> $k=\\dfrac{3}{32}$ and $P(1<X<3)=\\dfrac{11}{16}$.", micro: null }
        ] },
      { q: "For $f(x)=\\begin{cases} ax, &0\\le x<1\\\\ b(2-x), &1\\le x\\le2\\end{cases}$, find $a$ and $b$ if the PDF is continuous at $x=1$ and has total area 1.",
        steps: [
          { text: "Continuity at $x=1$ gives $a(1)=b(2-1)$, so $a=b$.", micro: { title: "Continuity condition", body: "The two pieces must meet at the join. Substitute the join value $x=1$ into both formulas and set them equal." } },
          { text: "Total area: $\\displaystyle\\int_0^1 ax\\,dx+\\int_1^2 b(2-x)\\,dx=1$.", micro: null },
          { text: "The two triangular areas are $\\dfrac{a}{2}$ and $\\dfrac{b}{2}$. Since $a=b$, total area is $a$, so $a=1$.", micro: null },
          { text: "Therefore <strong>$a=b=1$</strong>.", micro: null }
        ] }
    ]
  },

  uniform: {
    easy: [
      { q: "If $X\\sim U(2,10)$, find $P(4<X<7)$.",
        steps: [
          { text: "For a uniform distribution, probability is interval length divided by total length.", micro: { title: "Uniform = equal density", body: "Every interval of the same length has the same probability. So you can often use lengths instead of integrating." } },
          { text: "Total length is $10-2=8$. Event length is $7-4=3$.", micro: null },
          { text: "<strong>Answer:</strong> $P(4<X<7)=\\dfrac{3}{8}$.", micro: null }
        ] },
      { q: "For $X\\sim U(3,9)$, find the PDF $f(x)$.",
        steps: [
          { text: "A uniform PDF has constant height $\\dfrac1{b-a}$ on $[a,b]$.", micro: { title: "Rectangle area must be 1", body: "The density graph is a rectangle. Width is $b-a$, height is $1/(b-a)$, so area is 1." } },
          { text: "Here $a=3$ and $b=9$, so the height is $\\dfrac{1}{9-3}=\\dfrac16$.", micro: null },
          { text: "<strong>Answer:</strong> $f(x)=\\dfrac16$ for $3\\le x\\le9$, and $0$ otherwise.", micro: null }
        ] }
    ],
    medium: [
      { q: "A bus arrives uniformly between 7:00 and 7:20. Find the probability it arrives after 7:12, and find the expected arrival time in minutes after 7:00.",
        steps: [
          { text: "Let $X$ be the arrival time in minutes after 7:00. Then $X\\sim U(0,20)$.", micro: { title: "Translate the context", body: "Continuous uniform timing problems usually become $U(a,b)$ after you choose a sensible variable and units." } },
          { text: "$P(X>12)=\\dfrac{20-12}{20-0}=\\dfrac{8}{20}=\\dfrac25$.", micro: null },
          { text: "The expected value is the midpoint: $E(X)=\\dfrac{0+20}{2}=10$.", micro: null },
          { text: "<strong>Answer:</strong> probability $=\\dfrac25$; expected arrival is 7:10.", micro: null }
        ] },
      { q: "If $X\\sim U(a,14)$ and $E(X)=9$, find $a$ and then find $P(X<8)$.",
        steps: [
          { text: "For $U(a,b)$, $E(X)=\\dfrac{a+b}{2}$. So $\\dfrac{a+14}{2}=9$.", micro: { title: "Mean of a uniform", body: "The mean is exactly halfway between the endpoints because the density is symmetric and flat." } },
          { text: "Solve: $a+14=18$, so $a=4$.", micro: null },
          { text: "Now $X\\sim U(4,14)$. $P(X<8)=\\dfrac{8-4}{14-4}=\\dfrac4{10}=\\dfrac25$.", micro: null },
          { text: "<strong>Answer:</strong> $a=4$ and $P(X<8)=\\dfrac25$.", micro: null }
        ] }
    ],
    hard: [
      { q: "A machine fills bottles uniformly between 490 mL and 510 mL. Bottles are acceptable if they contain at least 495 mL. If 200 bottles are filled, estimate the expected number unacceptable.",
        steps: [
          { text: "Let $X\\sim U(490,510)$. Unacceptable means $X<495$.", micro: { title: "Connect probability to expected count", body: "Once you find the probability for one item, multiply by the number of items to get the expected count." } },
          { text: "$P(X<495)=\\dfrac{495-490}{510-490}=\\dfrac5{20}=\\dfrac14$.", micro: null },
          { text: "Expected number unacceptable $=200\\times\\dfrac14=50$.", micro: null },
          { text: "<strong>Answer:</strong> about $50$ bottles.", micro: null }
        ] },
      { q: "For $X\\sim U(a,b)$, the mean is 12 and the standard deviation is 4. Find $a$ and $b$.",
        steps: [
          { text: "For a uniform distribution, $E(X)=\\dfrac{a+b}{2}=12$, so $a+b=24$.", micro: { title: "Two conditions for two endpoints", body: "The mean gives the centre of the interval. The standard deviation gives the width of the interval." } },
          { text: "$SD(X)=\\dfrac{b-a}{\\sqrt{12}}=4$, so $b-a=4\\sqrt{12}=8\\sqrt3$.", micro: null },
          { text: "Solve the simultaneous equations: $b=12+4\\sqrt3$ and $a=12-4\\sqrt3$.", micro: null },
          { text: "<strong>Answer:</strong> $a=12-4\\sqrt3$, $b=12+4\\sqrt3$.", micro: null }
        ] }
    ]
  },

  cdf: {
    easy: [
      { q: "A continuous random variable has CDF $F(x)=\\dfrac{x^2}{16}$ for $0\\le x\\le4$. Find $P(X\\le3)$.",
        steps: [
          { text: "A CDF gives cumulative probability directly: $P(X\\le x)=F(x)$.", micro: { title: "CDF is already accumulated area", body: "Unlike a PDF, a CDF does not need integrating for a direct $P(X\\le a)$ question. Just substitute." } },
          { text: "Substitute $x=3$: $F(3)=\\dfrac{3^2}{16}=\\dfrac9{16}$.", micro: null },
          { text: "<strong>Answer:</strong> $P(X\\le3)=\\dfrac9{16}$.", micro: null }
        ] },
      { q: "Given $F(x)=\\dfrac{x^3}{27}$ for $0\\le x\\le3$, find the PDF $f(x)$.",
        steps: [
          { text: "Differentiate the CDF to get the PDF: $f(x)=F'(x)$.", micro: { title: "CDF to PDF", body: "The CDF accumulates area. Its derivative tells you the rate at which area is accumulating, which is the PDF." } },
          { text: "$F\'(x)=\\dfrac{3x^2}{27}=\\dfrac{x^2}{9}$.", micro: null },
          { text: "<strong>Answer:</strong> $f(x)=\\dfrac{x^2}{9}$ for $0\\le x\\le3$.", micro: null }
        ] }
    ],
    medium: [
      { q: "For $F(x)=\\dfrac{x^2}{25}$ on $0\\le x\\le5$, find $P(2<X<4)$.",
        steps: [
          { text: "Use the CDF difference rule: $P(2<X<4)=F(4)-F(2)$.", micro: { title: "Interval probability from a CDF", body: "A CDF gives probability to the left. To get probability between two values, subtract left areas: $F(b)-F(a)$." } },
          { text: "$F(4)=\\dfrac{16}{25}$ and $F(2)=\\dfrac4{25}$.", micro: null },
          { text: "<strong>Answer:</strong> $P(2<X<4)=\\dfrac{16}{25}-\\dfrac4{25}=\\dfrac{12}{25}$.", micro: null }
        ] },
      { q: "A random variable has PDF $f(x)=2x$ for $0\\le x\\le1$. Find its CDF, then find the median.",
        steps: [
          { text: "For $0\\le x\\le1$, $F(x)=\\displaystyle\\int_0^x 2t\\,dt=x^2$.", micro: { title: "Use a dummy variable", body: "When building a CDF, integrate from the lower support to the variable upper limit. Use $t$ inside the integral so $x$ stays as the upper-limit variable." } },
          { text: "The median $m$ satisfies $F(m)=0.5$, so $m^2=\\dfrac12$.", micro: null },
          { text: "Since $m\\ge0$, $m=\\dfrac1{\\sqrt2}=\\dfrac{\\sqrt2}{2}$.<br><strong>Answer:</strong> $F(x)=x^2$ on $[0,1]$, median $=\\dfrac{\\sqrt2}{2}$.", micro: null }
        ] }
    ],
    hard: [
      { q: "A CDF is $F(x)=\\begin{cases}0,&x<1\\\\ k(x-1)^2,&1\\le x\\le3\\\\1,&x>3\\end{cases}$. Find $k$, the PDF, and the median.",
        steps: [
          { text: "For a valid CDF, $F(3)=1$. So $k(3-1)^2=1$, giving $4k=1$ and $k=\\dfrac14$.", micro: { title: "CDF endpoint condition", body: "By the time you reach the right end of the support, all probability has accumulated, so the CDF must equal 1." } },
          { text: "For $1<x<3$, $f(x)=F'(x)=\\dfrac14\\cdot2(x-1)=\\dfrac{x-1}{2}$.", micro: null },
          { text: "Median $m$ satisfies $F(m)=\\dfrac12$: $\\dfrac14(m-1)^2=\\dfrac12$, so $(m-1)^2=2$.", micro: null },
          { text: "Since $1\\le m\\le3$, $m=1+\\sqrt2$.<br><strong>Answer:</strong> $k=\\dfrac14$, $f(x)=\\dfrac{x-1}{2}$, median $1+\\sqrt2$.", micro: null }
        ] },
      { q: "The CDF of $X$ is $F(x)=1-e^{-0.2x}$ for $x\\ge0$. Find the 90th percentile exactly in terms of $\\ln$.",
        steps: [
          { text: "The 90th percentile $q$ satisfies $F(q)=0.90$.", micro: { title: "Percentile as a CDF equation", body: "The 90th percentile is the value with 90% of the distribution at or below it." } },
          { text: "Set $1-e^{-0.2q}=0.90$, so $e^{-0.2q}=0.10$.", micro: null },
          { text: "Take natural logs: $-0.2q=\\ln(0.10)=\\ln\\left(\\dfrac1{10}\\right)=-\\ln10$.", micro: null },
          { text: "Therefore $q=5\\ln10$.<br><strong>Answer:</strong> the 90th percentile is $5\\ln10$.", micro: null }
        ] }
    ]
  },

  meanvar: {
    easy: [
      { q: "Let $X$ have PDF $f(x)=2x$ for $0\\le x\\le1$. Find $E(X)$.",
        steps: [
          { text: "Use $E(X)=\\displaystyle\\int x f(x)\\,dx$ over the support.", micro: { title: "Mean is weighted by x", body: "For continuous variables, $E(X)$ is found by integrating $x$ times the density." } },
          { text: "$E(X)=\\displaystyle\\int_0^1 x(2x)\\,dx=\\int_0^1 2x^2\\,dx$.", micro: null },
          { text: "$=\\left[\\dfrac{2x^3}{3}\\right]_0^1=\\dfrac23$.<br><strong>Answer:</strong> $E(X)=\\dfrac23$.", micro: null }
        ] },
      { q: "If $E(X)=10$ and $E(X^2)=116$, find $Var(X)$ and $SD(X)$.",
        steps: [
          { text: "Use $Var(X)=E(X^2)-[E(X)]^2$.", micro: { title: "Variance shortcut", body: "This formula is usually faster than integrating $(x-\\mu)^2f(x)$ directly." } },
          { text: "$Var(X)=116-10^2=16$.", micro: null },
          { text: "$SD(X)=\\sqrt{16}=4$.<br><strong>Answer:</strong> variance $16$, standard deviation $4$.", micro: null }
        ] }
    ],
    medium: [
      { q: "For $f(x)=\\dfrac{x}{2}$ on $0\\le x\\le2$, find $E(X)$ and $Var(X)$.",
        steps: [
          { text: "$E(X)=\\displaystyle\\int_0^2 x\\cdot\\dfrac{x}{2}\\,dx=\\int_0^2 \\dfrac{x^2}{2}\\,dx=\\left[\\dfrac{x^3}{6}\\right]_0^2=\\dfrac43$.", micro: { title: "Mean first", body: "Find $E(X)$ before variance, because $Var(X)$ uses $[E(X)]^2$." } },
          { text: "$E(X^2)=\\displaystyle\\int_0^2 x^2\\cdot\\dfrac{x}{2}\\,dx=\\int_0^2 \\dfrac{x^3}{2}\\,dx=\\left[\\dfrac{x^4}{8}\\right]_0^2=2$.", micro: null },
          { text: "$Var(X)=2-\\left(\\dfrac43\\right)^2=2-\\dfrac{16}{9}=\\dfrac29$.", micro: null },
          { text: "<strong>Answer:</strong> $E(X)=\\dfrac43$, $Var(X)=\\dfrac29$.", micro: null }
        ] },
      { q: "A PDF is $f(x)=\\dfrac34x^2$ on $0\\le x\\le2$? Check whether it is valid before finding the mean.",
        steps: [
          { text: "Check total area: $\\displaystyle\\int_0^2 \\dfrac34x^2\\,dx=\\dfrac34\\left[\\dfrac{x^3}{3}\\right]_0^2=\\dfrac34\\cdot\\dfrac83=2$.", micro: { title: "Validity before calculation", body: "A density must integrate to 1. If it doesn't, values like the mean will not represent a probability model." } },
          { text: "The total area is 2, not 1, so this is not a valid PDF.", micro: null },
          { text: "<strong>Answer:</strong> it is invalid as stated; do not calculate $E(X)$ from it unless the constant is corrected.", micro: null }
        ] }
    ],
    hard: [
      { q: "For $f(x)=kx^2$ on $0\\le x\\le3$, find $k$, $E(X)$ and $Var(X)$.",
        steps: [
          { text: "Normalise: $\\displaystyle\\int_0^3 kx^2\\,dx=k\\left[\\dfrac{x^3}{3}\\right]_0^3=9k=1$, so $k=\\dfrac19$.", micro: { title: "Do the constant first", body: "Every later calculation depends on the correct density constant." } },
          { text: "$E(X)=\\displaystyle\\int_0^3 x\\cdot\\dfrac{x^2}{9}\\,dx=\\left[\\dfrac{x^4}{36}\\right]_0^3=\\dfrac{81}{36}=\\dfrac94$.", micro: null },
          { text: "$E(X^2)=\\displaystyle\\int_0^3 x^2\\cdot\\dfrac{x^2}{9}\\,dx=\\left[\\dfrac{x^5}{45}\\right]_0^3=\\dfrac{243}{45}=\\dfrac{27}{5}$.", micro: null },
          { text: "$Var(X)=\\dfrac{27}{5}-\\left(\\dfrac94\\right)^2=\\dfrac{432}{80}-\\dfrac{405}{80}=\\dfrac{27}{80}$.<br><strong>Answer:</strong> $k=\\dfrac19$, $E(X)=\\dfrac94$, $Var(X)=\\dfrac{27}{80}$.", micro: null }
        ] },
      { q: "A triangular PDF is $f(x)=\\dfrac{x}{2}$ on $0\\le x\\le2$ and $f(x)=\\dfrac{4-x}{2}$ on $2<x\\le4$. Use symmetry to state $E(X)$, then set up $Var(X)$.",
        steps: [
          { text: "The PDF is symmetric about $x=2$, so $E(X)=2$.", micro: { title: "Symmetry shortcut", body: "If a distribution is symmetric, the mean is at the centre of symmetry. This saves a lot of integration." } },
          { text: "For variance, use $Var(X)=E(X^2)-4$ because $[E(X)]^2=2^2=4$.", micro: null },
          { text: "Set up $E(X^2)=\\displaystyle\\int_0^2 x^2\\dfrac{x}{2}\\,dx+\\int_2^4 x^2\\dfrac{4-x}{2}\\,dx$.", micro: null },
          { text: "This setup is enough to show the method; evaluating gives $E(X^2)=\\dfrac{14}{3}$ and $Var(X)=\\dfrac{2}{3}$.<br><strong>Answer:</strong> $E(X)=2$, $Var(X)=\\dfrac23$.", micro: null }
        ] }
    ]
  },

  transform: {
    easy: [
      { q: "If $E(X)=20$ and $SD(X)=3$, find $E(Y)$ and $SD(Y)$ for $Y=2X+5$.",
        steps: [
          { text: "For $Y=aX+b$, $E(Y)=aE(X)+b$ and $SD(Y)=|a|SD(X)$.", micro: { title: "Mean vs spread", body: "Adding shifts the centre but does not change spread. Multiplying scales both centre and spread." } },
          { text: "$E(Y)=2(20)+5=45$.", micro: null },
          { text: "$SD(Y)=|2|\\cdot3=6$.<br><strong>Answer:</strong> $E(Y)=45$, $SD(Y)=6$.", micro: null }
        ] },
      { q: "If $Var(X)=9$, find $Var(3X-7)$.",
        steps: [
          { text: "For $Y=aX+b$, $Var(Y)=a^2Var(X)$.", micro: { title: "Variance squares the scale factor", body: "Standard deviation is multiplied by $|a|$, so variance is multiplied by $a^2$. The added constant does not affect spread." } },
          { text: "$Var(3X-7)=3^2\\cdot9=81$.", micro: null },
          { text: "<strong>Answer:</strong> $81$.", micro: null }
        ] }
    ],
    medium: [
      { q: "A length $X$ in metres has $E(X)=1.8$ and $SD(X)=0.12$. Convert to centimetres using $Y=100X$. Find $E(Y)$ and $SD(Y)$.",
        steps: [
          { text: "The conversion is a multiplication by 100, with no added shift.", micro: { title: "Unit conversion as transformation", body: "Changing metres to centimetres scales every value by 100, so both the mean and standard deviation scale by 100." } },
          { text: "$E(Y)=100(1.8)=180$ cm.", micro: null },
          { text: "$SD(Y)=100(0.12)=12$ cm.<br><strong>Answer:</strong> mean $180$ cm, standard deviation $12$ cm.", micro: null }
        ] },
      { q: "If $E(X)=6$ and $Var(X)=4$, find $E(10-2X)$ and $Var(10-2X)$.",
        steps: [
          { text: "Here $Y=10-2X$, so $a=-2$ and $b=10$.", micro: { title: "Negative scale factor", body: "A negative scale reflects the distribution, but spread still uses $a^2$, so variance remains positive." } },
          { text: "$E(Y)=10-2E(X)=10-12=-2$.", micro: null },
          { text: "$Var(Y)=(-2)^2Var(X)=4\\cdot4=16$.", micro: null },
          { text: "<strong>Answer:</strong> $E(10-2X)=-2$, $Var(10-2X)=16$.", micro: null }
        ] }
    ],
    hard: [
      { q: "A delivery time $X$ in hours has mean $1.5$ and standard deviation $0.25$. A company charges $C=40X+15$ dollars. Find the mean and standard deviation of the charge, and interpret them.",
        steps: [
          { text: "Use $C=40X+15$. The fixed fee shifts the mean only; the hourly rate scales both mean and spread.", micro: { title: "Interpret the parameters", body: "$40X$ is the variable part of the cost. $+15$ is fixed, so it does not change variability." } },
          { text: "$E(C)=40(1.5)+15=75$ dollars.", micro: null },
          { text: "$SD(C)=40(0.25)=10$ dollars.", micro: null },
          { text: "<strong>Answer:</strong> average charge is $75, with typical spread about $10. The fixed fee raises all bills equally, while the hourly rate creates the variation.", micro: null }
        ] },
      { q: "A proposed PDF for adult heights is uniform on $[120,220]$ cm. Explain one strength and one weakness of this model.",
        steps: [
          { text: "Strength: it is simple, continuous, and uses a finite realistic-looking range of possible heights.", micro: { title: "Model judgement questions", body: "These questions are not just computation. You need to connect the mathematical assumptions to the real context." } },
          { text: "Weakness: adult heights are not equally likely across the whole interval; values near the middle are much more common than extremes.", micro: null },
          { text: "A better model would usually be bell-shaped rather than uniform, with most probability near the centre.<br><strong>Answer:</strong> valid simple range model, but unrealistic equal-likelihood assumption.", micro: null }
        ] }
    ]
  }
};

function renderCRVTier(topic, tier) {
  const container = document.getElementById('ctier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (CRVBANK[topic] && CRVBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: 'CRV Easy', medium: 'CRV Medium', hard: 'CRV Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];
  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;
  questions.forEach((qd, qi) => {
    const cardId = `crv-${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header"><span class="q-number">Q${qi+1}</span><div class="q-text">${protectMathHTML(qd.q)}</div></div>
      <div class="q-actions"><button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button></div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div><div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span><span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) html += `<span class="exp-step-hint-tag">stuck?</span>`;
      html += `<span class="exp-step-chevron">▶</span></div>`;
      if (step.micro) html += `<div class="exp-step-micro"><div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div><div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div></div>`;
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });
  container.innerHTML = html;
}

function initCRVBank() {
  ['pdf','uniform','cdf','meanvar','transform'].forEach(topic => {
    renderCRVTier(topic, 'easy');
    renderCRVTier(topic, 'medium');
    renderCRVTier(topic, 'hard');
  });
}



// ═══════════════════════════════════════════════════
// CONFIDENCE INTERVALS PAGE — topic/tier navigation + question bank
// ═══════════════════════════════════════════════════
function selectITopic(topic) {
  const targetBlock = document.getElementById('itopic-' + topic);
  if (!targetBlock) return;
  document.querySelectorAll('.itopic-content-block').forEach(b => b.classList.remove('active'));
  targetBlock.classList.add('active');
  document.querySelectorAll('.topic-pill-card[data-itopic]').forEach(c => c.classList.toggle('active', c.dataset.itopic === topic));
  document.querySelectorAll('.sidebar-item[data-itopic]').forEach(c => c.classList.toggle('active', c.dataset.itopic === topic));
  renderCITier(topic, 'easy');
  renderCITier(topic, 'medium');
  renderCITier(topic, 'hard');

  // Reset selected subtopic to its Easy tab so it never opens on a hidden tier.
  targetBlock.querySelectorAll('.diff-tab').forEach(tab => tab.classList.remove('active'));
  const firstTab = targetBlock.querySelector('.diff-tab');
  if (firstTab) firstTab.classList.add('active');
  targetBlock.querySelectorAll('.tier-block').forEach(block => block.classList.remove('active'));
  const easyBlock = document.getElementById('itier-' + topic + '-easy');
  if (easyBlock) easyBlock.classList.add('active');

  rerenderMath(targetBlock);
}

function selectITier(topic, tier, btn) {
  const tabsParent = btn.parentElement;
  tabsParent.querySelectorAll('.diff-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const blockParent = tabsParent.parentElement;
  blockParent.querySelectorAll('.tier-block').forEach(b => b.classList.remove('active'));
  document.getElementById('itier-' + topic + '-' + tier).classList.add('active');
}

const CIBANK = {
  "sampling": {
    "easy": [
      {
        "q": "In a survey of $250$ students, $68$ said they study Methods every night. Find the sample proportion $\\hat p$.",
        "steps": [
          {
            "text": "Use $\\hat p=\\dfrac{x}{n}$, where $x$ is the number of successes and $n$ is the sample size.",
            "micro": {
              "title": "What counts as a success?",
              "body": "A success is whatever the survey is measuring. Here, a success means a student said they study Methods every night."
            }
          },
          {
            "text": "Substitute $x=68$ and $n=250$: $\\hat p=\\dfrac{68}{250}=0.272$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $\\hat p=0.272$, or $27.2\\%$.",
            "micro": null
          }
        ]
      },
      {
        "q": "Suppose the true population proportion is $p=0.40$ and samples of size $n=625$ are taken. State the approximate mean and standard deviation of $\\hat p$.",
        "steps": [
          {
            "text": "For the sampling distribution of $\\hat p$, the mean is $p$.",
            "micro": {
              "title": "Centre of the sampling distribution",
              "body": "If repeated random samples are taken, the sample proportions vary, but they are centred around the true population proportion $p$."
            }
          },
          {
            "text": "The standard deviation is $\\sqrt{\\dfrac{p(1-p)}{n}}=\\sqrt{\\dfrac{0.40(0.60)}{625}}$.",
            "micro": null
          },
          {
            "text": "Calculate: $\\sqrt{0.24/625}=\\sqrt{0.000384}\\approx0.0196$.<br><strong>Answer:</strong> mean $=0.40$, SD $\\approx0.0196$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A population proportion is believed to be $p=0.30$. For samples of size $n=200$, describe the approximate distribution of $\\hat p$ and check whether a normal approximation is reasonable.",
        "steps": [
          {
            "text": "Check the large-sample conditions: $np=200(0.30)=60$ and $n(1-p)=200(0.70)=140$.",
            "micro": {
              "title": "Why these checks matter",
              "body": "The sample proportion is approximately normal when both expected successes and expected failures are large enough. A common rule is both at least 10."
            }
          },
          {
            "text": "Both values are greater than $10$, so a normal approximation is reasonable.",
            "micro": null
          },
          {
            "text": "Mean $=p=0.30$ and SD $=\\sqrt{0.30(0.70)/200}\\approx0.0324$.<br><strong>Answer:</strong> $\\hat p\\approx N(0.30, 0.0324^2)$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A school estimates the proportion of students who prefer online homework by surveying only students in an extension maths class. Explain one source of bias and suggest an improvement.",
        "steps": [
          {
            "text": "Identify the issue: the sample is not representative of the whole school population.",
            "micro": {
              "title": "Representative samples",
              "body": "A confidence interval only reflects the population well if the sample was selected in a way that fairly represents that population."
            }
          },
          {
            "text": "Students in an extension maths class may have different homework preferences from other students, so the estimate could be biased.",
            "micro": null
          },
          {
            "text": "Improve it by taking a random sample from all year levels/classes, or using stratified random sampling across year groups.<br><strong>Answer:</strong> biased sampling frame; use a broader random sample.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "Two surveys estimate support for a new timetable. Survey A asks $800$ randomly selected students across all year groups. Survey B asks $2000$ students who voluntarily respond to an online form. Which result should be treated more cautiously, and why?",
        "steps": [
          {
            "text": "Compare sample size and sampling method separately. Survey B has a larger sample size, but it is voluntary response.",
            "micro": {
              "title": "Large does not always mean reliable",
              "body": "A huge biased sample can still be worse than a smaller random sample. Randomness matters because it controls systematic bias."
            }
          },
          {
            "text": "Voluntary response samples often over-represent people with strong opinions, so Survey B may be biased even though $n$ is large.",
            "micro": null
          },
          {
            "text": "Survey A is more defensible because it is randomly selected across all year groups.<br><strong>Answer:</strong> Treat Survey B more cautiously due to voluntary response bias.",
            "micro": null
          }
        ]
      },
      {
        "q": "For samples of size $n=400$, the standard deviation of $\\hat p$ is $0.02$. Find the possible values of $p$.",
        "steps": [
          {
            "text": "Use $SD(\\hat p)=\\sqrt{\\dfrac{p(1-p)}{n}}$. Substitute $SD=0.02$ and $n=400$.",
            "micro": {
              "title": "Reverse sampling-distribution problem",
              "body": "When the SD is given, square both sides first to remove the square root."
            }
          },
          {
            "text": "$0.02=\\sqrt{\\dfrac{p(1-p)}{400}} \\Rightarrow 0.0004=\\dfrac{p(1-p)}{400}$, so $p(1-p)=0.16$.",
            "micro": null
          },
          {
            "text": "Solve $p-p^2=0.16 \\Rightarrow p^2-p+0.16=0$.<br>$p=\\dfrac{1\\pm\\sqrt{1-0.64}}{2}=\\dfrac{1\\pm0.6}{2}$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $p=0.2$ or $p=0.8$.",
            "micro": {
              "title": "Why two values?",
              "body": "The spread of $\\hat p$ is the same for $p$ and $1-p$. For example, $0.2(0.8)=0.8(0.2)$."
            }
          }
        ]
      }
    ]
  },
  "construct": {
    "easy": [
      {
        "q": "A sample has $\\hat p=0.62$ and $n=400$. Using $z^*=1.96$, construct a $95\\%$ confidence interval for $p$.",
        "steps": [
          {
            "text": "Use $\\hat p\\pm z^*\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$.",
            "micro": {
              "title": "Confidence interval structure",
              "body": "A confidence interval is estimate $\\pm$ margin of error. Here the estimate is $\\hat p$."
            }
          },
          {
            "text": "Calculate the standard error: $\\sqrt{\\dfrac{0.62(0.38)}{400}}\\approx0.0243$.",
            "micro": null
          },
          {
            "text": "Margin of error: $E=1.96(0.0243)\\approx0.0476$.",
            "micro": null
          },
          {
            "text": "Interval: $0.62\\pm0.0476=(0.5724,0.6676)$.<br><strong>Answer:</strong> approximately $(0.572,0.668)$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A confidence interval is given as $(0.41,0.49)$. State the centre and the margin of error.",
        "steps": [
          {
            "text": "The centre is the midpoint of the interval: $\\dfrac{0.41+0.49}{2}=0.45$.",
            "micro": {
              "title": "Midpoint idea",
              "body": "A confidence interval is symmetric around the sample proportion when it is written as $\\hat p\\pm E$."
            }
          },
          {
            "text": "The margin of error is half the width: $\\dfrac{0.49-0.41}{2}=0.04$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> centre $=0.45$, margin of error $=0.04$.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "In a sample of $600$ voters, $354$ support a proposal. Construct a $90\\%$ confidence interval using $z^*=1.645$.",
        "steps": [
          {
            "text": "Find the sample proportion: $\\hat p=\\dfrac{354}{600}=0.59$.",
            "micro": {
              "title": "Start with the statistic",
              "body": "The interval is built around the sample statistic, so calculate $\\hat p$ before using the formula."
            }
          },
          {
            "text": "Standard error: $\\sqrt{\\dfrac{0.59(0.41)}{600}}\\approx0.0201$.",
            "micro": null
          },
          {
            "text": "Margin of error: $E=1.645(0.0201)\\approx0.0330$.",
            "micro": null
          },
          {
            "text": "CI: $0.59\\pm0.033=(0.557,0.623)$.<br><strong>Answer:</strong> approximately $(0.557,0.623)$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A survey estimates $\\hat p=0.37$ from $n=500$. Use a $95\\%$ confidence interval with $z^*=1.96$ to estimate the number of people in a population of $12000$ who support the policy.",
        "steps": [
          {
            "text": "First construct the CI for the proportion: $0.37\\pm1.96\\sqrt{\\dfrac{0.37(0.63)}{500}}$.",
            "micro": {
              "title": "Proportion first, count second",
              "body": "Always build the interval for $p$ first. Then multiply the endpoints by the population size to convert to a count."
            }
          },
          {
            "text": "Standard error $\\approx0.0216$, so $E\\approx1.96(0.0216)=0.0423$.",
            "micro": null
          },
          {
            "text": "Proportion interval: $(0.3277,0.4123)$.",
            "micro": null
          },
          {
            "text": "Multiply by $12000$: $(3932.4,4947.6)$.<br><strong>Answer:</strong> about $3932$ to $4948$ people.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A company claims at least $70\\%$ of customers are satisfied. A random sample of $250$ customers gives $168$ satisfied. Use a $95\\%$ confidence interval to assess the claim.",
        "steps": [
          {
            "text": "Calculate $\\hat p=\\dfrac{168}{250}=0.672$.",
            "micro": {
              "title": "Assessing a claim with a CI",
              "body": "The claim is about the population proportion, so compare the claimed value to the confidence interval for $p$."
            }
          },
          {
            "text": "Use $z^*=1.96$: $E=1.96\\sqrt{\\dfrac{0.672(0.328)}{250}}\\approx1.96(0.0297)\\approx0.0582$.",
            "micro": null
          },
          {
            "text": "CI: $0.672\\pm0.0582=(0.6138,0.7302)$.",
            "micro": null
          },
          {
            "text": "Since $0.70$ lies inside the interval, the data do not give strong evidence against the claim. However, the interval also includes values below $0.70$.",
            "micro": {
              "title": "Careful wording",
              "body": "Do not say the claim is proven true. A confidence interval only tells us which population values are plausible based on the sample."
            }
          }
        ]
      },
      {
        "q": "Two random samples estimate the same population proportion. Sample A gives $0.48\\lt p\\lt0.56$ and Sample B gives $0.51\\lt p\\lt0.55$. Which interval is more precise, and what is the likely reason?",
        "steps": [
          {
            "text": "Precision is linked to width. A narrower interval gives a more precise estimate.",
            "micro": {
              "title": "Width = uncertainty",
              "body": "The less wide the interval is, the less uncertainty remains about plausible values of the population proportion."
            }
          },
          {
            "text": "Sample A width: $0.56-0.48=0.08$. Sample B width: $0.55-0.51=0.04$.",
            "micro": null
          },
          {
            "text": "Sample B is more precise because it is narrower. If the confidence level is the same, this is likely due to a larger sample size.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> Sample B is more precise; likely larger $n$ or lower variability in the standard error.",
            "micro": null
          }
        ]
      }
    ]
  },
  "interpret": {
    "easy": [
      {
        "q": "A $95\\%$ confidence interval for a proportion is $(0.28,0.36)$. Write it as an inequality for $p$.",
        "steps": [
          {
            "text": "The interval gives plausible values for the population proportion $p$.",
            "micro": {
              "title": "Parameter vs statistic",
              "body": "The confidence interval is about $p$, the unknown population proportion, not just the sample proportion $\\hat p$."
            }
          },
          {
            "text": "Write the endpoints around $p$: $0.28 < p < 0.36$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $0.28 < p < 0.36$.",
            "micro": null
          }
        ]
      },
      {
        "q": "State what happens to the width of a confidence interval when the confidence level is increased, with the same sample data.",
        "steps": [
          {
            "text": "Increasing the confidence level increases the critical value $z^*$.",
            "micro": {
              "title": "Confidence-width trade-off",
              "body": "To be more confident that the interval captures the true proportion, the interval needs to be wider."
            }
          },
          {
            "text": "Since $E=z^*\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$, a larger $z^*$ gives a larger margin of error.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> the interval becomes wider.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A report says: 'We are $95\\%$ confident that the proportion of students who prefer online homework is between $0.42$ and $0.50$.' Interpret this statement correctly.",
        "steps": [
          {
            "text": "The interval is about the unknown population proportion, not about individual students.",
            "micro": {
              "title": "Avoid the common wrong interpretation",
              "body": "Do not say there is a 95% probability that this specific fixed interval contains $p$ after it has been calculated. In frequentist language, $p$ is fixed and the method varies across repeated samples."
            }
          },
          {
            "text": "Correct interpretation: the method used to produce this interval captures the true population proportion in about $95\\%$ of repeated random samples.",
            "micro": null
          },
          {
            "text": "For this sample, plausible values for $p$ are from $0.42$ to $0.50$.<br><strong>Answer:</strong> repeated-sampling interpretation plus the plausible range.",
            "micro": null
          }
        ]
      },
      {
        "q": "A company claims that more than half of customers prefer its new design. A $95\\%$ confidence interval is $(0.47,0.54)$. What conclusion should be made?",
        "steps": [
          {
            "text": "The claim 'more than half' means $p>0.50$.",
            "micro": {
              "title": "Translate the claim",
              "body": "Before interpreting the interval, turn the wording into a mathematical statement about $p$."
            }
          },
          {
            "text": "The interval includes values below $0.50$ and above $0.50$.",
            "micro": null
          },
          {
            "text": "Because $0.50$ lies inside the interval, there is not clear evidence that the true proportion is greater than half.<br><strong>Answer:</strong> the claim is not strongly supported by this interval.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A simulation creates $100$ separate $95\\%$ confidence intervals for the same population proportion. How many would you expect to contain the true $p$, and does every interval have to contain $p$?",
        "steps": [
          {
            "text": "A $95\\%$ confidence method captures the true parameter in about $95\\%$ of repeated samples.",
            "micro": {
              "title": "Simulation meaning",
              "body": "Confidence level describes the long-run success rate of the interval-building method."
            }
          },
          {
            "text": "Out of $100$ intervals, we expect about $95$ to contain the true value of $p$.",
            "micro": null
          },
          {
            "text": "Not every interval has to contain $p$; about $5$ may miss it just by sampling variation.<br><strong>Answer:</strong> about $95$ contain $p$; no, not all must.",
            "micro": null
          }
        ]
      },
      {
        "q": "A $99\\%$ interval is $(0.31,0.45)$ and a $90\\%$ interval from the same sample is $(0.34,0.42)$. Explain why this is sensible.",
        "steps": [
          {
            "text": "Both intervals have the same centre: midpoint of $(0.31,0.45)$ is $0.38$, and midpoint of $(0.34,0.42)$ is also $0.38$.",
            "micro": {
              "title": "Same sample, same centre",
              "body": "Intervals from the same sample should usually be centred on the same $\\hat p$. The confidence level changes the margin of error, not the sample proportion."
            }
          },
          {
            "text": "The $99\\%$ interval is wider because it uses a larger critical value $z^*$.",
            "micro": null
          },
          {
            "text": "The $90\\%$ interval is narrower because it accepts a lower long-run capture rate.<br><strong>Answer:</strong> sensible: higher confidence gives a wider interval, with the same centre.",
            "micro": null
          }
        ]
      }
    ]
  },
  "margin": {
    "easy": [
      {
        "q": "For $\\hat p=0.55$, $n=900$ and $z^*=1.96$, find the margin of error.",
        "steps": [
          {
            "text": "Use $E=z^*\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$.",
            "micro": {
              "title": "Margin of error",
              "body": "The margin of error is the amount added and subtracted from $\\hat p$ to make the interval."
            }
          },
          {
            "text": "$E=1.96\\sqrt{\\dfrac{0.55(0.45)}{900}}$.",
            "micro": null
          },
          {
            "text": "$E\\approx1.96(0.0166)=0.0325$.<br><strong>Answer:</strong> margin of error $\\approx0.0325$ or $3.25\\%$.",
            "micro": null
          }
        ]
      },
      {
        "q": "If the sample size is increased while $\\hat p$ and the confidence level stay the same, what happens to the margin of error?",
        "steps": [
          {
            "text": "The sample size $n$ is in the denominator inside the square root.",
            "micro": {
              "title": "Why more data narrows the interval",
              "body": "More data usually reduces sampling variability, so the estimate becomes more precise."
            }
          },
          {
            "text": "As $n$ increases, $\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$ decreases.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> the margin of error decreases, so the interval becomes narrower.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "Find the minimum sample size required for a $95\\%$ confidence interval with margin of error at most $0.04$, using the conservative value $\\hat p=0.5$.",
        "steps": [
          {
            "text": "Use $E=z^*\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$ with $z^*=1.96$, $E=0.04$, $\\hat p=0.5$.",
            "micro": {
              "title": "Worst-case value",
              "body": "When $p$ is unknown, $0.5(0.5)=0.25$ gives the largest possible margin of error, so it is the conservative choice."
            }
          },
          {
            "text": "Set up: $0.04\\geq1.96\\sqrt{\\dfrac{0.25}{n}}$.",
            "micro": null
          },
          {
            "text": "Rearrange: $n\\geq\\dfrac{1.96^2(0.25)}{0.04^2}=600.25$.",
            "micro": null
          },
          {
            "text": "Round up to the next whole number.<br><strong>Answer:</strong> minimum $n=601$.",
            "micro": {
              "title": "Always round up",
              "body": "A sample size must be a whole number, and rounding down would give a margin of error slightly larger than allowed."
            }
          }
        ]
      },
      {
        "q": "A survey currently has margin of error $0.08$. If the confidence level and sample proportion stay the same, how many times larger must the sample size be to halve the margin of error?",
        "steps": [
          {
            "text": "Margin of error is proportional to $\\dfrac{1}{\\sqrt n}$ when the other factors stay fixed.",
            "micro": {
              "title": "Inverse-square relationship",
              "body": "To make the error smaller by a factor of $k$, the sample size must become $k^2$ times as large."
            }
          },
          {
            "text": "Halving the margin means multiplying the error by $\\dfrac12$.",
            "micro": null
          },
          {
            "text": "So the sample size must be multiplied by $2^2=4$.<br><strong>Answer:</strong> $4$ times as large.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A $90\\%$ interval uses $z^*=1.645$. A $99\\%$ interval uses $z^*=2.576$. By what factor must $n$ increase to keep the same margin of error?",
        "steps": [
          {
            "text": "For fixed $\\hat p$ and fixed $E$, sample size is proportional to $(z^*)^2$.",
            "micro": {
              "title": "Holding error fixed",
              "body": "A higher confidence level increases $z^*$, so $n$ must increase to compensate."
            }
          },
          {
            "text": "Factor $=\\left(\\dfrac{2.576}{1.645}\\right)^2$.",
            "micro": null
          },
          {
            "text": "Calculate: $\\left(1.566\\right)^2\\approx2.45$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> the sample size must be about $2.45$ times as large.",
            "micro": null
          }
        ]
      },
      {
        "q": "A researcher can survey at most $n=1000$ people. What is the largest possible $95\\%$ margin of error for a proportion estimate? Use $z^*=1.96$.",
        "steps": [
          {
            "text": "The largest possible value of $\\hat p(1-\\hat p)$ is $0.25$, which occurs at $\\hat p=0.5$.",
            "micro": {
              "title": "Maximum margin of error",
              "body": "The product $p(1-p)$ is largest at $p=0.5$. This is why $0.5$ is used when no prior estimate is available."
            }
          },
          {
            "text": "Use $E=1.96\\sqrt{\\dfrac{0.25}{1000}}$.",
            "micro": null
          },
          {
            "text": "$E\\approx1.96(0.01581)=0.0310$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> largest possible margin of error is about $0.031$, or $3.1\\%$.",
            "micro": null
          }
        ]
      }
    ]
  },
  "reverse": {
    "easy": [
      {
        "q": "A confidence interval is $(0.18,0.30)$. Find $\\hat p$ and the margin of error.",
        "steps": [
          {
            "text": "$\\hat p$ is the midpoint: $\\dfrac{0.18+0.30}{2}=0.24$.",
            "micro": {
              "title": "Working backwards",
              "body": "If the interval is written as $\\hat p\\pm E$, the centre is $\\hat p$ and the half-width is $E$."
            }
          },
          {
            "text": "Margin of error: $E=\\dfrac{0.30-0.18}{2}=0.06$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $\\hat p=0.24$, $E=0.06$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A sample of $n=320$ gives $\\hat p=0.375$. How many people in the sample had the characteristic being measured?",
        "steps": [
          {
            "text": "Use $\\hat p=\\dfrac{x}{n}$, so $x=n\\hat p$.",
            "micro": {
              "title": "Back from proportion to count",
              "body": "A sample proportion is just the success count divided by the sample size."
            }
          },
          {
            "text": "$x=320(0.375)=120$.",
            "micro": null
          },
          {
            "text": "<strong>Answer:</strong> $120$ people.",
            "micro": null
          }
        ]
      }
    ],
    "medium": [
      {
        "q": "A $95\\%$ confidence interval is centred at $0.64$. If $224$ people in the sample were successes, find the sample size.",
        "steps": [
          {
            "text": "The centre of the interval is $\\hat p$, so $\\hat p=0.64$.",
            "micro": {
              "title": "Use the centre",
              "body": "The interval centre tells you the sample proportion, even if the interval endpoints are not shown."
            }
          },
          {
            "text": "Use $\\hat p=\\dfrac{x}{n}$ with $x=224$: $0.64=\\dfrac{224}{n}$.",
            "micro": null
          },
          {
            "text": "Solve: $n=\\dfrac{224}{0.64}=350$.<br><strong>Answer:</strong> $n=350$.",
            "micro": null
          }
        ]
      },
      {
        "q": "A sample with $n=400$ and $\\hat p=0.60$ gives the interval $(0.559,0.641)$. Estimate the confidence level used.",
        "steps": [
          {
            "text": "Find the margin of error: $E=0.641-0.600=0.041$.",
            "micro": {
              "title": "Find $z^*$ from the interval",
              "body": "To recover a confidence level, first recover $z^*$ from $E=z^*\\times SE$."
            }
          },
          {
            "text": "Standard error: $SE=\\sqrt{\\dfrac{0.60(0.40)}{400}}=\\sqrt{0.0006}\\approx0.0245$.",
            "micro": null
          },
          {
            "text": "$z^*=\\dfrac{E}{SE}\\approx\\dfrac{0.041}{0.0245}\\approx1.67$.",
            "micro": null
          },
          {
            "text": "$z^*\\approx1.645$ corresponds to about a $90\\%$ confidence interval.<br><strong>Answer:</strong> approximately $90\\%$.",
            "micro": null
          }
        ]
      }
    ],
    "hard": [
      {
        "q": "A confidence interval for $p$ is $(0.216,0.304)$. It was based on $130$ successes. Estimate both the sample size and the confidence level used.",
        "steps": [
          {
            "text": "Find the centre: $\\hat p=\\dfrac{0.216+0.304}{2}=0.260$.",
            "micro": {
              "title": "Two unknowns from one interval",
              "body": "The interval gives you both $\\hat p$ from the midpoint and $E$ from the half-width."
            }
          },
          {
            "text": "Use $\\hat p=\\dfrac{x}{n}$ with $x=130$: $0.260=\\dfrac{130}{n}$, so $n=500$.",
            "micro": null
          },
          {
            "text": "Margin of error: $E=0.304-0.260=0.044$.",
            "micro": null
          },
          {
            "text": "Compute $SE=\\sqrt{\\dfrac{0.26(0.74)}{500}}\\approx0.0196$. Then $z^*=\\dfrac{0.044}{0.0196}\\approx2.24$.",
            "micro": null
          },
          {
            "text": "A $z^*$ of about $2.24$ corresponds to roughly a $97.5\\%$ confidence level.<br><strong>Answer:</strong> $n=500$, confidence level about $97.5\\%$.",
            "micro": {
              "title": "Using technology",
              "body": "On a calculator, confidence level is approximately $2\\Phi(z^*)-1$. For $z^*=2.24$, this is about $0.975$."
            }
          }
        ]
      },
      {
        "q": "A $95\\%$ interval is required to have the same width as a $90\\%$ interval from $n=600$. Assuming the same $\\hat p$, find the required sample size for the $95\\%$ interval. Use $z^*_{90}=1.645$ and $z^*_{95}=1.96$.",
        "steps": [
          {
            "text": "Same width means same margin of error. With $\\hat p$ fixed, $n$ scales with $(z^*)^2$.",
            "micro": {
              "title": "Same margin, different confidence",
              "body": "To keep the interval equally narrow while increasing confidence, the sample size must increase."
            }
          },
          {
            "text": "$n_{95}=600\\left(\\dfrac{1.96}{1.645}\\right)^2$.",
            "micro": null
          },
          {
            "text": "$n_{95}\\approx600(1.419)=851.4$.",
            "micro": null
          },
          {
            "text": "Round up: <strong>Answer:</strong> at least $852$ people.",
            "micro": null
          }
        ]
      }
    ]
  }
};


function renderCITier(topic, tier) {
  const container = document.getElementById('itier-' + topic + '-' + tier);
  if (!container) return;
  const questions = (CIBANK[topic] && CIBANK[topic][tier]) || [];
  if (questions.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:20px 0">More questions coming soon for this tier.</p>';
    return;
  }
  const tierLabel = { easy: 'CI Easy', medium: 'CI Medium', hard: 'CI Hard' }[tier];
  const tierClass = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' }[tier];
  let html = `<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <span class="tag ${tierClass}">${tierLabel}</span>
    <span style="font-size:13px;color:var(--muted)">Click "Show solution", then click any step to see why — or a similar mini example</span>
  </div>`;

  questions.forEach((qd, qi) => {
    const cardId = `ci-${topic}-${tier}-${qi}`;
    html += `<div class="q-card" id="card-${cardId}">
      <div class="q-header"><span class="q-number">Q${qi+1}</span><div class="q-text">${protectMathHTML(qd.q)}</div></div>
      <div class="q-actions"><button class="q-btn q-btn-reveal" onclick="toggleQAnswer('${cardId}')">Show solution</button></div>
      <div class="q-answer" id="ans-${cardId}">
        <div class="answer-label">Step-by-step solution — click a step to expand</div><div class="solution-steps-list">`;
    qd.steps.forEach((step, si) => {
      const stepId = `${cardId}-s${si}`;
      html += `<div class="exp-step" id="step-${stepId}">
        <div class="exp-step-head" onclick="toggleStep('${stepId}')">
          <span class="step-num">${si+1}</span><span class="exp-step-text">${protectMathHTML(step.text)}</span>`;
      if (step.micro) html += `<span class="exp-step-hint-tag">stuck?</span>`;
      html += `<span class="exp-step-chevron">▶</span></div>`;
      if (step.micro) html += `<div class="exp-step-micro"><div class="exp-step-micro-title">💡 ${protectMathHTML(step.micro.title)}</div><div class="exp-step-micro-body">${protectMathHTML(step.micro.body)}</div></div>`;
      html += `</div>`;
    });
    html += `</div></div></div>`;
  });
  container.innerHTML = html;
}

function initCIBank() {
  ['sampling','construct','interpret','margin','reverse'].forEach(topic => {
    renderCITier(topic, 'easy');
    renderCITier(topic, 'medium');
    renderCITier(topic, 'hard');
  });
}

// ═══════════════════════════════════════════════════
// GAME — Which Rule?
// ═══════════════════════════════════════════════════
const gameQuestions = [
  { expr: 'x^3 e^{2x}', answer: 'product', exp: 'It\'s a product: $x^3$ × $e^{2x}$. Use Product Rule, but remember $e^{2x}$ needs the chain rule too.' },
  { expr: '\\sin(3x^2)', answer: 'chain', exp: 'Composite function: $\\sin(\\square)$ where $\\square = 3x^2$. Always chain rule.' },
  { expr: '\\dfrac{x^2 + 1}{\\cos x}', answer: 'quotient', exp: 'Numerator over denominator — Quotient Rule. $u = x^2+1$, $v = \\cos x$.' },
  { expr: 'e^{x^2}', answer: 'chain', exp: '$e^{\\square}$ where $\\square = x^2$. Outer: $e^x$, inner: $x^2$. Chain rule.' },
  { expr: 'x \\ln x', answer: 'product', exp: 'Product of $x$ and $\\ln x$. Product rule.' },
  { expr: '\\cos(5x - 2)', answer: 'chain', exp: 'Composite function. Inner: $5x-2$, outer: $\\cos$. Chain rule, result: $-5\\sin(5x-2)$.' },
  { expr: '3x^4 - 7x + 2', answer: 'basic', exp: 'Polynomial — differentiate term by term. Basic power rule.' },
  { expr: '\\dfrac{e^x}{x^2}', answer: 'quotient', exp: 'Top over bottom: Quotient Rule. $u = e^x$, $v = x^2$.' },
  { expr: '(x^2 + 3)^5', answer: 'chain', exp: 'Power of a function: $(\\square)^5$ where $\\square = x^2 + 3$. Chain rule.' },
  { expr: 'x^2 \\sin x', answer: 'product', exp: 'Two functions multiplied: $x^2$ and $\\sin x$. Product rule.' },
  { expr: 'e^{3x} + x^{-2}', answer: 'basic', exp: 'Sum of standard functions. Differentiate each term separately — no special rule needed beyond basic.' },
  { expr: '\\dfrac{\\ln x}{x}', answer: 'quotient', exp: 'Fraction: quotient rule. Or you could recognise and use product rule on $\\ln x \\cdot x^{-1}$ — both work.' },
  { expr: '\\sqrt{x^3 + 1}', answer: 'chain', exp: '$(x^3+1)^{1/2}$ is a composite. Chain rule: $\\frac{1}{2}(x^3+1)^{-1/2} \\cdot 3x^2$.' },
  { expr: '5e^x \\cos x', answer: 'product', exp: 'Two functions: $5e^x$ and $\\cos x$. Product rule.' },
  { expr: '\\ln(x^2 + 4)', answer: 'chain', exp: '$\\ln(\\square)$ where $\\square = x^2 + 4$. Chain rule: $\\frac{1}{x^2+4} \\cdot 2x$.' },
];

let gameState = { idx: 0, correct: 0, wrong: 0, streak: 0, answered: false, hints: [] };

function initGame() {
  gameState = { idx: Math.floor(Math.random() * gameQuestions.length), correct: 0, wrong: 0, streak: 0, answered: false };
  updateScoreDisplay();
  loadQuestion();
}

function loadQuestion() {
  gameState.answered = false;
  const q = gameQuestions[gameState.idx];
  const exprEl = document.getElementById('game-expr');
  exprEl.innerHTML = '';
  if (window.katex) {
    katex.render(q.expr, exprEl, { throwOnError: false, displayMode: true });
  } else {
    exprEl.textContent = q.expr;
  }
  document.getElementById('game-feedback').innerHTML = '';
  document.getElementById('game-next').style.display = 'none';
  document.getElementById('game-inst').textContent = 'Select the rule you would use to differentiate this function';
  ['product', 'quotient', 'chain', 'basic'].forEach(r => {
    const btn = document.getElementById('btn-' + r);
    btn.classList.remove('correct', 'wrong');
    btn.disabled = false;
  });
}

function checkRule(rule) {
  if (gameState.answered) return;
  gameState.answered = true;
  const q = gameQuestions[gameState.idx];
  const correct = rule === q.answer;

  if (correct) {
    gameState.correct++;
    gameState.streak++;
    document.getElementById('btn-' + rule).classList.add('correct');
    document.getElementById('game-feedback').innerHTML =
      `<span class="feedback-correct">✓ Correct!</span><span class="feedback-explanation"> ${q.exp}</span>`;
  } else {
    gameState.wrong++;
    gameState.streak = 0;
    document.getElementById('btn-' + rule).classList.add('wrong');
    document.getElementById('btn-' + q.answer).classList.add('correct');
    document.getElementById('game-feedback').innerHTML =
      `<span class="feedback-wrong">✗ Not quite.</span><span class="feedback-explanation"> ${q.exp}</span>`;
  }
  updateScoreDisplay();
  ['product', 'quotient', 'chain', 'basic'].forEach(r => {
    document.getElementById('btn-' + r).disabled = true;
  });
  document.getElementById('game-next').style.display = 'block';

  // Re-render KaTeX in feedback
  if (window.renderMathInElement) {
    renderMathInElement(document.getElementById('game-feedback'), {
      delimiters: [{left:'$',right:'$',display:false}]
    });
  }
}

function nextQuestion() {
  let next;
  do { next = Math.floor(Math.random() * gameQuestions.length); }
  while (next === gameState.idx && gameQuestions.length > 1);
  gameState.idx = next;
  loadQuestion();
}

function updateScoreDisplay() {
  document.getElementById('score-correct').textContent = gameState.correct;
  document.getElementById('score-wrong').textContent = gameState.wrong;
  document.getElementById('score-streak').textContent = gameState.streak;
  document.getElementById('score-total').textContent = gameState.correct + gameState.wrong;
}

// ═══════════════════════════════════════════════════
// WACE BANK — Timer, Hints, Breakdown, Solutions
// ═══════════════════════════════════════════════════
const timers = {};
const hints = {
  1: [
    'For (a)(i): $f(x) = x^3 \\cdot e^{2x}$ — identify this as a <strong>product</strong> of two functions.',
    'Write $u = x^3$, $v = e^{2x}$. Then $u\' = 3x^2$ and $v\' = 2e^{2x}$ (chain rule on exponential).',
    'For (b): $\\int \\sin(ax+b)\\,dx = -\\frac{1}{a}\\cos(ax+b)+c$. Here $a=2$, $b=\\pi$.'
  ],
  2: [
    'For (a)(i): $\\ln 6 = \\ln(2 \\cdot 3)$. Use the product law: $\\ln(AB) = \\ln A + \\ln B$.',
    'For (a)(ii): $6.25 = \\frac{25}{4} = \\frac{5^2}{2^2}$. Quotient law then power law.',
    'For (c)(ii): From (i) you have $\\frac{d}{dx}(x\\ln x) = \\ln x + 1$. Rearrange to isolate $\\ln x$, then integrate both sides.'
  ],
  3: [
    'Simplify $v(t) = 2t\\cos(t+\\pi/2)$. Use the identity $\\cos(\\theta + \\pi/2) = -\\sin\\theta$ to rewrite.',
    'So $v(t) = -2t\\sin t$. Mass changes direction when $v = 0$. Since $t > 0$, solve $\\sin t = 0$.',
    'For distance (not displacement): $\\int|v(t)|\\,dt$. Check sign of $v$ on $[\\pi/3, \\pi]$ vs $[\\pi, 4\\pi/3]$ and split the integral.'
  ],
  4: [
    'For (a): $P(X \\leq 150) = 0.0228$. In a standard normal, $\\Phi(-2) \\approx 0.0228$. So $\\frac{150-\\mu}{\\sigma} = -2$.',
    'Similarly $P(X \\geq 165) = 0.1587$, so $P(X \\leq 165) = 0.8413 = \\Phi(1)$. Thus $\\frac{165-\\mu}{\\sigma} = 1$. Solve the system.',
    'For (d): $\\hat{p} = $ midpoint of CI $= 0.1$. Use $E = z^*\\sqrt{\\hat{p}(1-\\hat{p})/n}$ with $n=200$, $E=0.035$ to find $z^*$, then identify the confidence level.'
  ]
};

const hintCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
const maxHints = 3;

function startTimer(n) {
  document.getElementById('start-btn-' + n).style.display = 'none';
  document.getElementById('hint-btn-' + n).disabled = false;
  let totalSeconds = 180;
  const circumference = 188.4;
  const fillEl = document.getElementById('timer-fill-' + n);
  const textEl = document.getElementById('timer-text-' + n);
  const statusEl = document.getElementById('timer-status-' + n);

  timers[n] = setInterval(() => {
    totalSeconds--;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    textEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    const offset = circumference * (totalSeconds / 180);
    fillEl.style.strokeDashoffset = circumference - offset;

    if (totalSeconds <= 30) {
      fillEl.style.stroke = '#FF6B6B';
    } else if (totalSeconds <= 60) {
      fillEl.style.stroke = '#FFD166';
    }

    if (totalSeconds <= 0) {
      clearInterval(timers[n]);
      textEl.textContent = '✓';
      fillEl.style.stroke = '#43E97B';
      statusEl.className = 'timer-status timer-unlocked';
      statusEl.textContent = '✅ Time\'s up — reveal the answer!';
      document.getElementById('ans-btn-' + n).disabled = false;
    }
  }, 1000);
}

function showHint(n) {
  const idx = hintCounts[n];
  if (idx >= hints[n].length) return;
  hintCounts[n]++;
  const totalHintsForQuestion = (hints[n] && hints[n].length) ? hints[n].length : maxHints;
  const remaining = totalHintsForQuestion - hintCounts[n];
  document.getElementById('hints-left-' + n).textContent = Math.max(remaining, 0);
  if (remaining <= 0) document.getElementById('hint-btn-' + n).disabled = true;

  const panel = document.getElementById('hint-' + n);
  panel.classList.add('visible');
  document.getElementById('hint-content-' + n).innerHTML = hints[n][idx];
  if (window.renderMathInElement) {
    renderMathInElement(panel, {
      delimiters: [{left:'$',right:'$',display:false},{left:'$$',right:'$$',display:true}]
    });
  }
}

function toggleBreakdown(n) {
  const panel = document.getElementById('breakdown-' + n);
  const isVisible = panel.classList.contains('visible');
  panel.classList.toggle('visible', !isVisible);
  if (!isVisible && window.renderMathInElement) {
    renderMathInElement(panel, {
      delimiters: [{left:'$',right:'$',display:false},{left:'$$',right:'$$',display:true}]
    });
  }
}

function showWACEAnswer(n) {
  const panel = document.getElementById('solution-' + n);
  panel.classList.add('visible');
  document.getElementById('ans-btn-' + n).disabled = true;
  if (window.renderMathInElement) {
    renderMathInElement(panel, {
      delimiters: [{left:'$',right:'$',display:false},{left:'$$',right:'$$',display:true}]
    });
  }
}

const waceFilterState = { topic: 'all', year: 'all', section: 'all', randomOnly: null };

function normaliseWACESection(value) {
  const raw = (value || '').toLowerCase();
  if (raw.includes('free')) return 'calculator-free';
  if (raw.includes('assumed')) return 'calculator-assumed';
  return raw || 'all';
}

function getWACECards() {
  return Array.from(document.querySelectorAll('#page-wace .wace-q-card'));
}

function annotateWACECards() {
  getWACECards().forEach(card => {
    if (!card.dataset.year) {
      const yearText = card.querySelector('.wace-year-badge')?.textContent?.trim();
      if (yearText) card.dataset.year = yearText;
    }
    if (!card.dataset.section) {
      const sectionText = card.querySelector('.wace-section-badge')?.textContent?.trim();
      card.dataset.section = normaliseWACESection(sectionText);
    } else {
      card.dataset.section = normaliseWACESection(card.dataset.section);
    }
  });
}

function setWACEActiveButton(btn) {
  if (!btn) return;
  const group = btn.closest('[data-wace-filter-group]') || btn.parentElement;
  if (group) group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function waceCardMatchesFilters(card) {
  const cardTopics = card.dataset.topic || '';
  const cardYear = card.dataset.year || '';
  const cardSection = normaliseWACESection(card.dataset.section || '');
  const topicOk = waceFilterState.topic === 'all' || cardTopics.split(/\s+/).includes(waceFilterState.topic) || cardTopics.includes(waceFilterState.topic);
  const yearOk = waceFilterState.year === 'all' || cardYear === waceFilterState.year;
  const sectionOk = waceFilterState.section === 'all' || cardSection === waceFilterState.section;
  return topicOk && yearOk && sectionOk;
}

function updateWACERandomStatus(message) {
  const status = document.getElementById('wace-random-status');
  if (status && message) status.innerHTML = message;
}

function applyWACEFilters() {
  annotateWACECards();
  const cards = getWACECards();
  let visibleCount = 0;
  cards.forEach(card => {
    const match = waceCardMatchesFilters(card);
    const randomMatch = !waceFilterState.randomOnly || card === waceFilterState.randomOnly;
    const show = match && randomMatch;
    card.style.display = show ? '' : 'none';
    card.classList.toggle('random-selected', waceFilterState.randomOnly === card);
    if (show) visibleCount++;
  });
  if (!waceFilterState.randomOnly) {
    updateWACERandomStatus(`Showing ${visibleCount} question${visibleCount === 1 ? '' : 's'} in the current filter set.`);
  }
}

function filterWACE(topic, btn) {
  waceFilterState.topic = topic;
  waceFilterState.randomOnly = null;
  setWACEActiveButton(btn);
  applyWACEFilters();
}

function filterWACEYear(year, btn) {
  waceFilterState.year = year;
  waceFilterState.randomOnly = null;
  setWACEActiveButton(btn);
  applyWACEFilters();
}

function filterWACESection(section, btn) {
  waceFilterState.section = section;
  waceFilterState.randomOnly = null;
  setWACEActiveButton(btn);
  applyWACEFilters();
}

function showRandomWACEQuestion() {
  annotateWACECards();
  const pool = getWACECards().filter(waceCardMatchesFilters);
  if (!pool.length) {
    waceFilterState.randomOnly = null;
    applyWACEFilters();
    updateWACERandomStatus('No questions match those filters. Try broadening the topic, year or section.');
    return;
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  waceFilterState.randomOnly = chosen;
  applyWACEFilters();
  const title = chosen.querySelector('.wace-q-text strong')?.textContent?.trim() || 'Random question';
  const year = chosen.dataset.year || chosen.querySelector('.wace-year-badge')?.textContent?.trim() || '';
  const section = chosen.querySelector('.wace-section-badge')?.textContent?.trim() || '';
  updateWACERandomStatus(`Random pick: <strong>${year} ${section}</strong> — ${title}`);
  chosen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearRandomWACEQuestion() {
  waceFilterState.randomOnly = null;
  applyWACEFilters();
  const bank = document.getElementById('page-wace');
  if (bank) bank.scrollIntoView({ behavior: 'smooth', block: 'start' });
}




// ═══════════════════════════════════════════════════
// SUPPLEMENTARY GUIDED PRACTICE
// Adds one extra worked question to every currently available subtopic.
// These are intentionally medium-style consolidation questions so every menu item has extra practice.
// ═══════════════════════════════════════════════════
let supplementaryPracticeAdded = false;
function addSupplementaryQuestion(bank, topic, tier, q) {
  if (!bank || !bank[topic] || !Array.isArray(bank[topic][tier])) return;
  if (bank[topic][tier].some(existing => existing.q === q.q)) return;
  bank[topic][tier].push(q);
}

function addSupplementaryPractice() {
  if (supplementaryPracticeAdded) return;
  supplementaryPracticeAdded = true;

  // Integration subtopics
  addSupplementaryQuestion(QBANK, 'power', 'medium', {
    q: "Find $\\displaystyle\\int \\left(2x^5-\\dfrac{3}{\\sqrt{x}}+4\\right)\\,dx$.",
    steps: [
      { text: "Rewrite the root term: $\\dfrac{3}{\\sqrt{x}}=3x^{-1/2}$, so the integrand is $2x^5-3x^{-1/2}+4$.", micro: null },
      { text: "Integrate term by term using the power rule.", micro: null },
      { text: "$\\int 2x^5dx=\\dfrac{x^6}{3}$, $\\int -3x^{-1/2}dx=-6x^{1/2}$, and $\\int 4dx=4x$.", micro: null },
      { text: "<strong>Answer:</strong> $\\dfrac{x^6}{3}-6\\sqrt{x}+4x+c$.", micro: null }
    ]
  });
  addSupplementaryQuestion(QBANK, 'trigexp', 'medium', {
    q: "Find $\\displaystyle\\int \\left(5e^{-2x}-3\\sin(2x)\\right)\\,dx$.",
    steps: [
      { text: "Split the integral into two standard forms: exponential and sine.", micro: null },
      { text: "$\\int 5e^{-2x}dx=5\\cdot\\dfrac{e^{-2x}}{-2}=-\\dfrac{5}{2}e^{-2x}$.", micro: null },
      { text: "$\\int -3\\sin(2x)dx=-3\\left(-\\dfrac{\\cos(2x)}{2}\\right)=\\dfrac{3}{2}\\cos(2x)$.", micro: null },
      { text: "<strong>Answer:</strong> $-\\dfrac{5}{2}e^{-2x}+\\dfrac{3}{2}\\cos(2x)+c$.", micro: null }
    ]
  });
  addSupplementaryQuestion(QBANK, 'chain', 'medium', {
    q: "Find $\\displaystyle\\int 8(2x-1)^3\\,dx$.",
    steps: [
      { text: "The inner function is $2x-1$, whose derivative is $2$.", micro: null },
      { text: "Integrate the bracket power: $(2x-1)^3 \\mapsto \\dfrac{(2x-1)^4}{4}$, then divide by the inner derivative $2$.", micro: null },
      { text: "$\\int 8(2x-1)^3dx=8\\cdot\\dfrac{(2x-1)^4}{4\\cdot2}$.", micro: null },
      { text: "<strong>Answer:</strong> $(2x-1)^4+c$.", micro: null }
    ]
  });
  addSupplementaryQuestion(QBANK, 'ftc', 'medium', {
    q: "Evaluate the signed area $\\displaystyle\\int_{-1}^{2}(3x^2-1)\\,dx$.",
    steps: [
      { text: "Find an antiderivative: $\\int(3x^2-1)dx=x^3-x$.", micro: null },
      { text: "Apply the Fundamental Theorem: $[x^3-x]_{-1}^{2}$.", micro: null },
      { text: "At $x=2$: $8-2=6$. At $x=-1$: $-1-(-1)=0$.", micro: null },
      { text: "<strong>Answer:</strong> $6-0=6$.", micro: null }
    ]
  });
  addSupplementaryQuestion(QBANK, 'applications', 'medium', {
    q: "Find the area enclosed by $y=4-x^2$ and the x-axis.",
    steps: [
      { text: "Find x-intercepts: $4-x^2=0\\Rightarrow x=\\pm2$.", micro: null },
      { text: "On $[-2,2]$, the curve is above the x-axis, so area is $\\int_{-2}^{2}(4-x^2)dx$.", micro: null },
      { text: "Use symmetry or integrate directly: $[4x-\\dfrac{x^3}{3}]_{-2}^{2}$.", micro: null },
      { text: "<strong>Answer:</strong> $\\dfrac{32}{3}$ square units.", micro: null }
    ]
  });

  // Derivatives subtopics
  addSupplementaryQuestion(DBANK, 'power', 'medium', {
    q: "Differentiate $f(x)=(x+2)(x^2-1)$ by expanding first.",
    steps: [
      { text: "Expand: $(x+2)(x^2-1)=x^3+2x^2-x-2$.", micro: null },
      { text: "Differentiate term by term: $3x^2+4x-1+0$.", micro: null },
      { text: "<strong>Answer:</strong> $f'(x)=3x^2+4x-1$.", micro: null }
    ]
  });
  addSupplementaryQuestion(DBANK, 'trigexp', 'medium', {
    q: "Find the equation of the tangent to $y=2\\cos x+e^x$ at $x=0$.",
    steps: [
      { text: "Find the point: $y(0)=2\\cos0+e^0=2(1)+1=3$, so the point is $(0,3)$.", micro: null },
      { text: "Differentiate: $y'=-2\\sin x+e^x$.", micro: null },
      { text: "At $x=0$, the gradient is $-2\\sin0+e^0=1$.", micro: null },
      { text: "<strong>Answer:</strong> $y-3=1(x-0)$, so $y=x+3$.", micro: null }
    ]
  });
  addSupplementaryQuestion(DBANK, 'prodquot', 'medium', {
    q: "Differentiate $f(x)=x^3\\sin x$.",
    steps: [
      { text: "This is a product with $u=x^3$ and $v=\\sin x$.", micro: null },
      { text: "Find $u'=3x^2$ and $v'=\\cos x$.", micro: null },
      { text: "Apply product rule: $f'(x)=3x^2\\sin x+x^3\\cos x$.", micro: null },
      { text: "<strong>Answer:</strong> $x^2(3\\sin x+x\\cos x)$.", micro: null }
    ]
  });
  addSupplementaryQuestion(DBANK, 'chain', 'medium', {
    q: "Differentiate $f(x)=e^{1-2x^2}$.",
    steps: [
      { text: "Outer function is $e^{\\square}$ and inner function is $1-2x^2$.", micro: null },
      { text: "Differentiate the inner: $\\dfrac{d}{dx}(1-2x^2)=-4x$.", micro: null },
      { text: "Apply chain rule: $f'(x)=e^{1-2x^2}(-4x)$.", micro: null },
      { text: "<strong>Answer:</strong> $f'(x)=-4xe^{1-2x^2}$.", micro: null }
    ]
  });
  addSupplementaryQuestion(DBANK, 'applications', 'medium', {
    q: "For $f(x)=x^3-3x^2-9x+1$, find the stationary points and classify them.",
    steps: [
      { text: "Differentiate: $f'(x)=3x^2-6x-9=3(x^2-2x-3)$.", micro: null },
      { text: "Set $f'(x)=0$: $3(x-3)(x+1)=0$, so $x=3$ or $x=-1$.", micro: null },
      { text: "Second derivative: $f''(x)=6x-6$.", micro: null },
      { text: "$f''(-1)=-12<0$, so $x=-1$ is a local maximum. $f''(3)=12>0$, so $x=3$ is a local minimum.", micro: null }
    ]
  });

  // Discrete random variables subtopics
  addSupplementaryQuestion(RBANK, 'probfunc', 'medium', {
    q: "A discrete random variable has $P(X=0)=k$, $P(X=1)=2k$, $P(X=2)=3k$. Find $k$.",
    steps: [
      { text: "All probabilities in a probability function must add to $1$.", micro: null },
      { text: "Set up: $k+2k+3k=1$.", micro: null },
      { text: "So $6k=1$, giving $k=\\dfrac16$.", micro: null },
      { text: "<strong>Answer:</strong> $k=\\dfrac16$.", micro: null }
    ]
  });
  addSupplementaryQuestion(RBANK, 'expectation', 'medium', {
    q: "Given $P(X=1)=0.2$, $P(X=3)=0.5$, $P(X=6)=0.3$, find $E(X)$.",
    steps: [
      { text: "Use $E(X)=\\sum xP(X=x)$.", micro: null },
      { text: "$E(X)=1(0.2)+3(0.5)+6(0.3)$.", micro: null },
      { text: "$=0.2+1.5+1.8=3.5$.", micro: null },
      { text: "<strong>Answer:</strong> $E(X)=3.5$.", micro: null }
    ]
  });
  addSupplementaryQuestion(RBANK, 'variance', 'medium', {
    q: "If $E(X)=5$ and $Var(X)=4$, find $E(3X-2)$ and $Var(3X-2)$.",
    steps: [
      { text: "Use the linear transformation rules: $E(aX+b)=aE(X)+b$ and $Var(aX+b)=a^2Var(X)$.", micro: null },
      { text: "$E(3X-2)=3(5)-2=13$.", micro: null },
      { text: "$Var(3X-2)=3^2\\cdot4=36$.", micro: null },
      { text: "<strong>Answer:</strong> $E(3X-2)=13$, $Var(3X-2)=36$.", micro: null }
    ]
  });
  addSupplementaryQuestion(RBANK, 'cdftrans', 'medium', {
    q: "For $P(X=0)=0.1$, $P(X=1)=0.4$, $P(X=2)=0.5$, find $P(X\\le1)$.",
    steps: [
      { text: "$P(X\\le1)$ means add probabilities where $X=0$ or $X=1$.", micro: null },
      { text: "$P(X\\le1)=P(X=0)+P(X=1)$.", micro: null },
      { text: "$=0.1+0.4=0.5$.", micro: null },
      { text: "<strong>Answer:</strong> $0.5$.", micro: null }
    ]
  });
  addSupplementaryQuestion(RBANK, 'binomial', 'medium', {
    q: "Let $X\\sim B(5,0.3)$. Find $P(X\\ge2)$ using the complement.",
    steps: [
      { text: "$P(X\\ge2)=1-P(X\\le1)=1-[P(X=0)+P(X=1)]$.", micro: null },
      { text: "$P(X=0)=0.7^5$.", micro: null },
      { text: "$P(X=1)=\\binom51(0.3)(0.7)^4$.", micro: null },
      { text: "<strong>Answer:</strong> $1-0.7^5-5(0.3)(0.7)^4\\approx0.4718$.", micro: null }
    ]
  });

  // Logarithms subtopics
  addSupplementaryQuestion(LBANK, 'basics', 'medium', {
    q: "Simplify $\\log_2(8x)-\\log_2\\left(\\dfrac{x}{4}\\right)$ for $x>0$.",
    steps: [
      { text: "Use the quotient law: $\\log_2 A-\\log_2 B=\\log_2\\left(\\dfrac{A}{B}\\right)$.", micro: null },
      { text: "$\\log_2(8x)-\\log_2\\left(\\dfrac{x}{4}\\right)=\\log_2\\left(\\dfrac{8x}{x/4}\\right)$.", micro: null },
      { text: "Simplify inside: $\\dfrac{8x}{x/4}=32$.", micro: null },
      { text: "<strong>Answer:</strong> $\\log_2 32=5$.", micro: null }
    ]
  });
  addSupplementaryQuestion(LBANK, 'equations', 'medium', {
    q: "Solve $\\log_3(x-1)+\\log_3(x+1)=2$.",
    steps: [
      { text: "Domain first: $x-1>0$ and $x+1>0$, so $x>1$.", micro: null },
      { text: "Combine logs: $\\log_3[(x-1)(x+1)]=2$.", micro: null },
      { text: "Convert to index form: $(x-1)(x+1)=3^2=9$.", micro: null },
      { text: "$x^2-1=9\\Rightarrow x^2=10$, so $x=\\sqrt{10}$ since $x>1$.", micro: null }
    ]
  });
  addSupplementaryQuestion(LBANK, 'graphs', 'medium', {
    q: "For $y=\\log_2(x-3)+1$, state the vertical asymptote and the x-intercept.",
    steps: [
      { text: "The input to the log is $x-3$, so the vertical asymptote occurs when $x-3=0$.", micro: null },
      { text: "Vertical asymptote: $x=3$.", micro: null },
      { text: "For the x-intercept, set $y=0$: $\\log_2(x-3)+1=0$.", micro: null },
      { text: "$\\log_2(x-3)=-1$, so $x-3=2^{-1}=\\dfrac12$, hence $x=\\dfrac72$.", micro: null }
    ]
  });
  addSupplementaryQuestion(LBANK, 'modelling', 'medium', {
    q: "A quantity follows $A(t)=500e^{-0.12t}$. Find the time when it first falls to $200$.",
    steps: [
      { text: "Set the model equal to $200$: $500e^{-0.12t}=200$.", micro: null },
      { text: "Divide by $500$: $e^{-0.12t}=0.4$.", micro: null },
      { text: "Take natural logs: $-0.12t=\\ln(0.4)$.", micro: null },
      { text: "<strong>Answer:</strong> $t=\\dfrac{\\ln(0.4)}{-0.12}\\approx7.64$ time units.", micro: null }
    ]
  });
  addSupplementaryQuestion(LBANK, 'lncalc', 'medium', {
    q: "Differentiate $f(x)=x\\ln(2x)$ for $x>0$.",
    steps: [
      { text: "This is a product: $u=x$ and $v=\\ln(2x)$.", micro: null },
      { text: "$u'=1$ and $v'=\\dfrac{2}{2x}=\\dfrac1x$.", micro: null },
      { text: "Apply product rule: $f'(x)=1\\cdot\\ln(2x)+x\\cdot\\dfrac1x$.", micro: null },
      { text: "<strong>Answer:</strong> $f'(x)=\\ln(2x)+1$.", micro: null }
    ]
  });

  // Continuous random variables subtopics
  addSupplementaryQuestion(CRVBANK, 'pdf', 'medium', {
    q: "Let $f(x)=kx^2$ for $0\\le x\\le3$. Find $k$ and $P(X>1)$.",
    steps: [
      { text: "Use total area $1$: $\\int_0^3 kx^2dx=1$.", micro: null },
      { text: "$k\\left[\\dfrac{x^3}{3}\\right]_0^3=9k=1$, so $k=\\dfrac19$.", micro: null },
      { text: "$P(X>1)=\\int_1^3 \\dfrac{x^2}{9}dx$.", micro: null },
      { text: "<strong>Answer:</strong> $\\left[\\dfrac{x^3}{27}\\right]_1^3=1-\\dfrac{1}{27}=\\dfrac{26}{27}$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CRVBANK, 'uniform', 'medium', {
    q: "Let $X\\sim U(2,10)$. Find $P(4<X<7)$.",
    steps: [
      { text: "For a uniform distribution, probability is interval length divided by total length.", micro: null },
      { text: "Total length is $10-2=8$.", micro: null },
      { text: "Target interval length is $7-4=3$.", micro: null },
      { text: "<strong>Answer:</strong> $P(4<X<7)=\\dfrac{3}{8}$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CRVBANK, 'cdf', 'medium', {
    q: "A CDF is $F(x)=\\dfrac{x^2}{16}$ for $0\\le x\\le4$. Find the median.",
    steps: [
      { text: "The median $m$ satisfies $F(m)=0.5$.", micro: null },
      { text: "Set $\\dfrac{m^2}{16}=\\dfrac12$.", micro: null },
      { text: "Then $m^2=8$, so $m=2\\sqrt2$ because $m$ is in $[0,4]$.", micro: null },
      { text: "<strong>Answer:</strong> median $=2\\sqrt2$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CRVBANK, 'meanvar', 'medium', {
    q: "Let $f(x)=2x$ for $0\\le x\\le1$. Find $E(X)$.",
    steps: [
      { text: "For a continuous random variable, $E(X)=\\int x f(x)dx$ over the support.", micro: null },
      { text: "$E(X)=\\int_0^1 x(2x)dx=\\int_0^1 2x^2dx$.", micro: null },
      { text: "Evaluate: $\\left[\\dfrac{2x^3}{3}\\right]_0^1=\\dfrac23$.", micro: null },
      { text: "<strong>Answer:</strong> $E(X)=\\dfrac23$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CRVBANK, 'transform', 'medium', {
    q: "If $E(X)=6$ and $SD(X)=2$, find $E(3X-5)$ and $SD(3X-5)$.",
    steps: [
      { text: "For $Y=aX+b$, $E(Y)=aE(X)+b$.", micro: null },
      { text: "$E(3X-5)=3(6)-5=13$.", micro: null },
      { text: "Standard deviation is multiplied by $|a|$, not shifted by $b$.", micro: null },
      { text: "<strong>Answer:</strong> $SD(3X-5)=3(2)=6$.", micro: null }
    ]
  });

  // Confidence intervals subtopics
  addSupplementaryQuestion(CIBANK, 'sampling', 'medium', {
    q: "In a sample of $120$ people, $84$ support a proposal. Find $\\hat p$ and estimate $SD(\\hat p)$ using $\\hat p$.",
    steps: [
      { text: "The sample proportion is $\\hat p=\\dfrac{84}{120}=0.7$.", micro: null },
      { text: "Estimate the standard deviation using $\\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}}$.", micro: null },
      { text: "$SD(\\hat p)\\approx\\sqrt{\\dfrac{0.7(0.3)}{120}}$.", micro: null },
      { text: "<strong>Answer:</strong> $SD(\\hat p)\\approx0.0418$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CIBANK, 'construct', 'medium', {
    q: "Construct an approximate 95% confidence interval when $60$ out of $200$ surveyed people say yes.",
    steps: [
      { text: "Find $\\hat p=\\dfrac{60}{200}=0.30$.", micro: null },
      { text: "For 95%, use $z=1.96$.", micro: null },
      { text: "Margin of error $E=1.96\\sqrt{\\dfrac{0.30(0.70)}{200}}\\approx0.0635$.", micro: null },
      { text: "<strong>Answer:</strong> $(0.30-0.0635,0.30+0.0635)=(0.2365,0.3635)$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CIBANK, 'interpret', 'medium', {
    q: "A 95% confidence interval for a population proportion is $(0.34,0.46)$. Is the claim $p=0.40$ plausible?",
    steps: [
      { text: "Check whether the claimed value lies inside the interval.", micro: null },
      { text: "$0.40$ is between $0.34$ and $0.46$.", micro: null },
      { text: "So the data do not provide strong evidence against $p=0.40$ at this confidence level.", micro: null },
      { text: "<strong>Answer:</strong> yes, $p=0.40$ is plausible because it lies inside the interval.", micro: null }
    ]
  });
  addSupplementaryQuestion(CIBANK, 'margin', 'medium', {
    q: "Find the required sample size for a 95% confidence interval with margin of error at most $0.04$, using the conservative value $p=0.5$.",
    steps: [
      { text: "Use $E=z\\sqrt{\\dfrac{p(1-p)}{n}}$ with $z=1.96$, $p=0.5$, and $E=0.04$.", micro: null },
      { text: "$0.04=1.96\\sqrt{\\dfrac{0.25}{n}}$.", micro: null },
      { text: "Rearrange: $n=\\dfrac{1.96^2(0.25)}{0.04^2}=600.25$.", micro: null },
      { text: "<strong>Answer:</strong> round up to $n=601$.", micro: null }
    ]
  });
  addSupplementaryQuestion(CIBANK, 'reverse', 'medium', {
    q: "A confidence interval is $(0.52,0.58)$. Find its centre and margin of error.",
    steps: [
      { text: "The centre is the midpoint of the interval.", micro: null },
      { text: "Centre $=\\dfrac{0.52+0.58}{2}=0.55$.", micro: null },
      { text: "Margin of error is half the width.", micro: null },
      { text: "<strong>Answer:</strong> margin $=\\dfrac{0.58-0.52}{2}=0.03$.", micro: null }
    ]
  });
}

// ═══════════════════════════════════════════════════
// SITE-WIDE QUESTION QUALITY PASS
// Adds context-aware "stuck?" dropdowns to solution steps that do not yet have one.
// Existing hand-written hints are preserved.
// ═══════════════════════════════════════════════════
function autoMicroForStep(stepText, stepIndex, bankName) {
  const txt = String(stepText || '').replace(/<[^>]*>/g, ' ');
  const lower = txt.toLowerCase();
  const make = (title, body) => ({ title, body });

  if (/differentiate|derivative|gradient|f'|dy\/dx|d\/dx/.test(lower)) {
    return make('Derivative checkpoint', 'Ask: what is changing? If the step is finding a gradient or rate, use the derivative. For products, quotients, and composites, label the structure first before applying a rule.');
  }
  if (/integrate|antiderivative|area under|definite integral|fundamental theorem/.test(lower)) {
    return make('Integration checkpoint', 'Integration is accumulation or reverse differentiation. For definite integrals, find an antiderivative first, then substitute upper limit minus lower limit.');
  }
  if (/rewrite|convert|index|negative|fractional|root|sqrt|reciprocal/.test(lower)) {
    return make('Rewrite before using the rule', 'Many errors happen because the expression is not in the right form yet. Convert roots/reciprocals to index notation, or combine terms, before applying the main rule.');
  }
  if (/expand|factor|simplif|single fraction|positive indices|common factor/.test(lower)) {
    return make('Algebra clean-up', 'This step is about making the expression easier to use. Look for common factors, matching denominators, or a simpler equivalent form before moving on.');
  }
  if (/substitute|evaluate|at x|at t|upper|lower|plug/.test(lower)) {
    return make('Substitution checkpoint', 'Keep the formula unchanged first, then substitute the value carefully. For intervals, calculate the upper value and lower value separately before subtracting.');
  }
  if (/set .*zero|stationary|horizontal tangent|maximum|minimum|optimis/.test(lower)) {
    return make('Why set it to zero?', 'Stationary points and optimisation points occur where the first derivative is zero, unless the endpoint of a restricted domain also needs checking.');
  }
  if (/second derivative|concavity|inflection|f''|acceleration/.test(lower)) {
    return make('Second derivative meaning', 'The second derivative describes how the gradient is changing. Positive means concave up; negative means concave down; a sign change can indicate an inflection point.');
  }
  if (/pdf|density|continuous|cdf|quantile|median|uniform/.test(lower)) {
    return make('Continuous random variable idea', 'For continuous variables, probabilities are areas. Use the PDF by integrating, use the CDF by reading cumulative probability, and remember point probabilities are zero.');
  }
  if (/expected value|mean|e\(|variance|standard deviation|var\(/.test(lower)) {
    return make('Mean and spread reminder', 'The mean is the long-run centre. Variance measures spread using squared deviations, often faster as $Var(X)=E(X^2)-[E(X)]^2$.');
  }
  if (/confidence|interval|margin|sample size|claim|proportion|phat|hat/.test(lower)) {
    return make('Confidence interval reasoning', 'A confidence interval is centred on the sample proportion/statistic and extends by a margin of error. Wider intervals mean more uncertainty or higher confidence.');
  }
  if (/log|ln|exponential|base|asymptote/.test(lower)) {
    return make('Logarithm checkpoint', 'Logarithms undo exponentials. Check the base, apply log laws only when the base matches, and keep domain restrictions in mind.');
  }
  if (/solve|equation|simultaneous|isolate|rearrange/.test(lower)) {
    return make('Solving checkpoint', 'Work one algebra move at a time. If the unknown is inside a function, isolate that function first before applying the inverse operation.');
  }
  if (/interpret|context|units|meaning/.test(lower)) {
    return make('Interpreting the result', 'Translate the number back into the situation. Include units when relevant and state whether the answer is a value, a rate, a probability, or a decision.');
  }
  return make('Why this step matters', 'This step moves the solution from the question setup toward the answer. Check the rule being used, keep notation clear, and make sure each line follows from the one before it.');
}

function enrichMicroHints(bank, bankName) {
  if (!bank) return;
  Object.keys(bank).forEach(topic => {
    ['easy','medium','hard'].forEach(tier => {
      const questions = bank[topic] && bank[topic][tier];
      if (!Array.isArray(questions)) return;
      questions.forEach(q => {
        if (!Array.isArray(q.steps)) return;
        q.steps.forEach((step, i) => {
          if (!step.micro) step.micro = autoMicroForStep(step.text, i, bankName);
        });
      });
    });
  });
}

function enrichAllBanks() {
  enrichMicroHints(typeof QBANK !== 'undefined' ? QBANK : null, 'integration');
  enrichMicroHints(typeof DBANK !== 'undefined' ? DBANK : null, 'derivatives');
  enrichMicroHints(typeof RBANK !== 'undefined' ? RBANK : null, 'drv');
  enrichMicroHints(typeof LBANK !== 'undefined' ? LBANK : null, 'logs');
  enrichMicroHints(typeof CRVBANK !== 'undefined' ? CRVBANK : null, 'crv');
  enrichMicroHints(typeof CIBANK !== 'undefined' ? CIBANK : null, 'ci');
}

// ═══════════════════════════════════════════════════
// WACE BANK — 2022 Exam Expansion
// Dynamically appends the 2022 Calculator-Free and Calculator-Assumed questions
// into the existing WACE Bank format.
// ═══════════════════════════════════════════════════
const WACE_EXTRA_QUESTIONS = [{"id": 5, "year": "2022", "section": "Calculator-Free", "title": "Question 1 — derivative function, antiderivative and FTC", "topics": "differentiation integration logarithms", "marks": "9 marks", "body": "<p>Consider the derivative function $f'(x)=\\dfrac{4x}{x^2+3}$.</p>\n<div class=\"wace-q-parts\">\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the rate of change of $f'(x)$ when $x=1$.</div><div class=\"wace-part-marks\">3 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine $f(x)$ given that $f(1)=\\ln(32)$.</div><div class=\"wace-part-marks\">4 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Determine $\\dfrac{d}{dt}\\displaystyle\\int_t^3 f(x)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n</div>", "breakdown": ["For (a), the rate of change of $f'(x)$ is $f''(x)$. Differentiate $\\dfrac{4x}{x^2+3}$ using the quotient rule.", "For (b), integrate $f'(x)$. The substitution idea is $u=x^2+3$, because $du=2x\\,dx$.", "For (c), use the FTC carefully: $\\dfrac{d}{dt}\\int_t^3 f(x)\\,dx=-f(t)$ because the variable is on the lower limit."], "hints": ["Differentiate the whole derivative function once more for part (a).", "In part (b), $\\int \\frac{4x}{x^2+3}\\,dx=2\\ln(x^2+3)+c$.", "For part (c), reverse the limits if needed: $\\int_t^3 f(x)dx=-\\int_3^t f(x)dx$."], "solutions": [{"label": "a", "html": "$f''(x)=\\dfrac{4(x^2+3)-4x(2x)}{(x^2+3)^2}=\\dfrac{12-4x^2}{(x^2+3)^2}$. Hence $f''(1)=\\dfrac{8}{16}=\\dfrac12$."}, {"label": "b", "html": "$f(x)=\\int \\dfrac{4x}{x^2+3}\\,dx=2\\ln(x^2+3)+c$. Using $f(1)=\\ln32$: $2\\ln4+c=\\ln32$, so $c=\\ln2$. Therefore $f(x)=2\\ln(x^2+3)+\\ln2$."}, {"label": "c", "html": "$\\dfrac{d}{dt}\\int_t^3 f(x)\\,dx=-f(t)=-\\big[2\\ln(t^2+3)+\\ln2\\big]$."}], "source": "2022 WACE"}, {"id": 6, "year": "2022", "section": "Calculator-Free", "title": "Question 2 — graph integrals and FTC", "topics": "integration differentiation", "marks": "6 marks", "body": "<p>A function $f(x)$ is shown by the following graph description:</p>\n<p style=\"color:var(--muted);font-size:13px;line-height:1.6\">From $x=0$ to $1$, $f$ rises linearly from $0$ to $2$; from $1$ to $3$, $f(x)=2$; from $3$ to $4$, $f(x)=-1$; from $4$ to $6$, $f$ falls linearly from $2$ to $0$.</p>\n<div class=\"wace-q-parts\">\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Evaluate $\\displaystyle\\int_0^6 f(x)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Evaluate $\\displaystyle\\int_0^4 (f(x)-2)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Evaluate $\\displaystyle\\int_4^6 f'(x)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n</div>", "breakdown": ["Break the graph into simple shapes: triangle, rectangle, rectangle below the axis, triangle.", "For (b), use linearity: $\\int_0^4(f(x)-2)dx=\\int_0^4 f(x)dx-\\int_0^4 2dx$.", "For (c), use the FTC: $\\int_a^b f'(x)dx=f(b)-f(a)$."], "hints": ["Areas above the axis are positive; areas below are negative.", "Subtracting 2 shifts the whole graph down by 2 units.", "The integral of $f'$ measures total change in $f$, not area under $f$."], "solutions": [{"label": "a", "html": "Areas: triangle $0$–$1$: $1$; rectangle $1$–$3$: $4$; rectangle $3$–$4$: $-1$; triangle $4$–$6$: $2$. Total $=1+4-1+2=6$."}, {"label": "b", "html": "$\\int_0^4 f(x)dx=1+4-1=4$. Also $\\int_0^4 2dx=8$. Therefore $\\int_0^4(f(x)-2)dx=4-8=-4$."}, {"label": "c", "html": "$\\int_4^6 f'(x)dx=f(6)-f(4)=0-2=-2$."}], "source": "2022 WACE"}, {"id": 7, "year": "2022", "section": "Calculator-Free", "title": "Question 3 — continuous random variables and binomial follow-up", "topics": "crv probability drv", "marks": "11 marks", "body": "<p>The delivery time $X$ for Isosceles Toy Company has a triangular PDF on $10\\leq x\\leq14$, with peak $f(12)=\\frac12$ and $f(10)=f(14)=0$.</p>\n<div class=\"wace-q-parts\">\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">What is the expected time for delivery?</div><div class=\"wace-part-marks\">1 mark</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">The birthday is 13 weeks away. Find the probability the toy arrives in time.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Given it arrives in time, find the probability it arrives at least one week early.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Uniform Toys has $Y\\sim U(9,14)$. Which company maximises the chance of delivery within 13 weeks?</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)</div><div class=\"wace-part-text\">Five people order from Uniform Toys. Let $Z$ be the number receiving the toy within 13 weeks. State the distribution of $Z$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(f)</div><div class=\"wace-part-text\">Find the probability exactly four of the five receive it within 13 weeks.</div><div class=\"wace-part-marks\">2 marks</div></div>\n</div>", "breakdown": ["Use symmetry for the triangular PDF: its centre is $x=12$.", "For the in-time probability, it is easier to subtract the small right-hand triangle from 1.", "Uniform Toys gives a constant density $1/(14-9)=0.2$; then convert the repeated orders into a binomial model."], "hints": ["A symmetric triangular distribution has its mean at the centre of symmetry.", "Conditional probability means $P(A|B)=P(A\\cap B)/P(B)$.", "For $Z$, the number of successes in 5 independent orders with the same probability is binomial."], "solutions": [{"label": "a", "html": "The triangular PDF is symmetric about $x=12$, so $E(X)=12$ weeks."}, {"label": "b", "html": "$P(X\\leq13)=1-P(13\\lt X\\leq14)$. The small right triangle has base $1$ and height $\\frac14$, so area $=\\frac12\\cdot1\\cdot\\frac14=\\frac18$. Hence $P(X\\leq13)=\\frac78$."}, {"label": "c", "html": "At least one week early means $X\\leq12$, while in time means $X\\leq13$. Thus $P(X\\leq12\\mid X\\leq13)=\\dfrac{1/2}{7/8}=\\dfrac47$."}, {"label": "d", "html": "For Uniform Toys, $P(Y\\leq13)=\\dfrac{13-9}{14-9}=\\dfrac45=0.8$. Isosceles gives $7/8=0.875$, so choose <strong>Isosceles Toy Company</strong>."}, {"label": "e", "html": "For Uniform Toys, success probability $p=0.8$. Therefore $Z\\sim B(5,0.8)$."}, {"label": "f", "html": "$P(Z=4)=\\binom54(0.8)^4(0.2)=0.4096$."}], "source": "2022 WACE"}, {"id": 8, "year": "2022", "section": "Calculator-Free", "title": "Question 4 — logarithmic graphs and transformations", "topics": "logarithms", "marks": "12 marks", "body": "<p>The graph of $f(x)=\\log_2(x)$ is used to answer the following.</p>\n<div class=\"wace-q-parts\">\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)(i)</div><div class=\"wace-part-text\">Solve $\\log_2(x-5)=3$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)(ii)</div><div class=\"wace-part-text\">Determine $\\sqrt7$, correct to one decimal place, using the graph idea.</div><div class=\"wace-part-marks\">3 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">A translated graph has vertical asymptote $x=0$ and passes through $(1,3)$. Determine $g(x)$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)(i)</div><div class=\"wace-part-text\">Show that $\\log_2\\!\\left(\\dfrac1{x-1}\\right)=-\\log_2(x-1)$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)(ii)</div><div class=\"wace-part-text\">Hence sketch $h(x)=\\log_2\\!\\left(\\dfrac1{x-1}\\right)$.</div><div class=\"wace-part-marks\">3 marks</div></div>\n</div>", "breakdown": ["Convert logarithmic form to index form: $\\log_2 A=3$ means $A=2^3$.", "A vertical translation keeps the vertical asymptote in the same place; use the point $(1,3)$.", "For part (c), use the reciprocal law: $\\log_b(1/A)=\\log_b(A^{-1})=-\\log_b A$."], "hints": ["Remember: logarithms ask “what power?”", "If $g(x)=\\log_2 x+k$ and $g(1)=3$, then $0+k=3$.", "The graph of $-\\log_2(x-1)$ is a reflection of $\\log_2(x-1)$ in the x-axis."], "solutions": [{"label": "a.i", "html": "$\\log_2(x-5)=3\\Rightarrow x-5=2^3=8\\Rightarrow x=13$."}, {"label": "a.ii", "html": "Since $\\log_2(7)\\approx2.8$, $\\log_2(\\sqrt7)=\\frac12\\log_2(7)\\approx1.4$. From the graph, $x\\approx2.6$, so $\\sqrt7\\approx2.6$."}, {"label": "b", "html": "The asymptote stays at $x=0$, so there is no horizontal shift. Since $\\log_2(1)=0$ and the translated graph has value $3$ at $x=1$, $g(x)=\\log_2(x)+3$."}, {"label": "c.i", "html": "$\\log_2\\!\\left(\\dfrac1{x-1}\\right)=\\log_2((x-1)^{-1})=-\\log_2(x-1)$."}, {"label": "c.ii", "html": "Sketch $\\log_2(x-1)$ shifted right 1, then reflect it in the x-axis. The vertical asymptote is $x=1$, and the x-intercept is at $(2,0)$."}], "source": "2022 WACE"}, {"id": 9, "year": "2022", "section": "Calculator-Free", "title": "Question 5 — sketching from derivative information", "topics": "differentiation", "marks": "5 marks", "body": "<p>A continuous function $f$ satisfies:</p>\n<ul style=\"color:var(--muted);font-size:13px;line-height:1.7;margin-left:18px\"><li>$f(2)=0$</li><li>$f$ has exactly two stationary points</li><li>$f'(-1)=0$ and $f'(1)=0$</li><li>$f''(-1)=4$</li><li>$f'(2)>0$</li></ul>\n<p>Sketch one possible function satisfying these conditions.</p>", "breakdown": ["Mark the two stationary x-values first: $x=-1$ and $x=1$.", "$f''(-1)=4>0$, so the stationary point at $x=-1$ must be a local minimum.", "The graph must pass through $(2,0)$ while increasing there, since $f'(2)>0$."], "hints": ["You do not need a unique graph; any graph satisfying all conditions earns marks.", "A positive second derivative at a stationary point indicates concave up locally.", "Make sure you do not accidentally draw a third stationary point."], "solutions": [{"label": "sketch", "html": "A valid sketch has a local minimum at $x=-1$, another stationary point at $x=1$ (for example a horizontal point of inflection), crosses $(2,0)$, and is increasing at $x=2$. The key is satisfying all derivative conditions, not matching one unique curve."}], "source": "2022 WACE"}, {"id": 10, "year": "2022", "section": "Calculator-Free", "title": "Question 6 — product rule, hence integral and continuous PDF", "topics": "differentiation integration crv", "marks": "11 marks", "body": "<div class=\"wace-q-parts\">\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)(i)</div><div class=\"wace-part-text\">Determine $\\dfrac{d}{dx}\\left[x\\sin\\left(\\dfrac{\\pi x}{4}\\right)\\right]$.</div><div class=\"wace-part-marks\">2 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)(ii)</div><div class=\"wace-part-text\">Hence show that $\\displaystyle\\int \\dfrac{\\pi x}{4}\\cos\\left(\\dfrac{\\pi x}{4}\\right)dx=x\\sin\\left(\\dfrac{\\pi x}{4}\\right)+\\dfrac4\\pi\\cos\\left(\\dfrac{\\pi x}{4}\\right)+c$.</div><div class=\"wace-part-marks\">3 marks</div></div>\n  <div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">The time $T$ between phone calls has PDF $p(t)=\\dfrac\\pi4\\cos\\left(\\dfrac{\\pi t}{4}\\right)$ for $0\\leq t\\leq2$. Find $P(T\\lt 40\\text{ seconds})$ exactly, then find $E(T)$.</div><div class=\"wace-part-marks\">6 marks</div></div>\n</div>", "breakdown": ["Use product rule for $x\\sin(\\pi x/4)$.", "For the hence part, rearrange the derivative so the target integrand is isolated.", "Convert 40 seconds to $\\frac23$ minutes before using the PDF."], "hints": ["The derivative of $\\sin(\\pi x/4)$ brings down $\\pi/4$.", "Check a “hence” question by differentiating the proposed antiderivative.", "Expected value for a continuous random variable is $E(T)=\\int t p(t)dt$."], "solutions": [{"label": "a.i", "html": "$\\dfrac{d}{dx}\\left[x\\sin\\left(\\dfrac{\\pi x}{4}\\right)\\right]=\\sin\\left(\\dfrac{\\pi x}{4}\\right)+\\dfrac{\\pi x}{4}\\cos\\left(\\dfrac{\\pi x}{4}\\right)$."}, {"label": "a.ii", "html": "Rearrange: $\\dfrac{\\pi x}{4}\\cos\\left(\\dfrac{\\pi x}{4}\\right)=\\dfrac{d}{dx}\\left[x\\sin\\left(\\dfrac{\\pi x}{4}\\right)\\right]-\\sin\\left(\\dfrac{\\pi x}{4}\\right)$. Integrating gives the stated result because $\\int-\\sin(\\pi x/4)dx=\\frac4\\pi\\cos(\\pi x/4)$."}, {"label": "b.i", "html": "$40$ seconds $=\\frac23$ minutes. $P(T\\lt\\frac23)=\\int_0^{2/3}\\frac\\pi4\\cos(\\pi t/4)dt=\\left[\\sin(\\pi t/4)\\right]_0^{2/3}=\\sin(\\pi/6)=\\frac12$."}, {"label": "b.ii", "html": "$E(T)=\\int_0^2 t\\frac\\pi4\\cos(\\pi t/4)dt=\\left[t\\sin(\\pi t/4)+\\frac4\\pi\\cos(\\pi t/4)\\right]_0^2=2-\\frac4\\pi$ minutes."}], "source": "2022 WACE"}, {"id": 11, "year": "2022", "section": "Calculator-Assumed", "title": "Question 7 — trench area and maximum depth", "topics": "integration differentiation", "marks": "10 marks", "body": "<p>The displacement from sea level to the ocean floor is</p><div class=\"key-formula\">$$D(x)=(x-4)^2+\\cos(2x-3\\pi)-5$$</div><p>on $x_1\\leq x\\leq x_2$, and $D(x)=-2$ otherwise. The trench is the region below the seabed level $D=-2$.</p>\n<div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine $x_1,x_2$, then use calculus to determine the cross-sectional area of the trench.</div><div class=\"wace-part-marks\">5 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Using calculus, determine the maximum distance of the trench below sea level.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["The endpoints occur where the curved trench meets the flat seabed: solve $D(x)=-2$.", "The shaded area is $\\int_{x_1}^{x_2}[-2-D(x)]\\,dx$.", "Maximum depth means the minimum value of $D(x)$, so solve $D'(x)=0$ inside the trench interval."], "hints": ["This is calculator-assumed: numerical roots are expected.", "Area is positive vertical gap: seabed minus curve.", "Depth below sea level is $-D(x)$ when $D(x)$ is negative."], "solutions": [{"label": "a", "html": "Solving $D(x)=-2$ gives $x_1\\approx2.300$ and $x_2\\approx5.944$. The area is $\\int_{2.300}^{5.944}[-2-D(x)]dx\\approx7.03\\text{ km}^2$."}, {"label": "b", "html": "$D'(x)=2(x-4)-2\\sin(2x-3\\pi)$. Solving $D'(x)=0$ in the interval gives $x\\approx3.439$. Then $D(3.439)\\approx-5.514$, so the maximum depth below sea level is approximately $5.51$ km."}], "source": "2022 WACE"}, {"id": 12, "year": "2022", "section": "Calculator-Assumed", "title": "Question 8 — petrol sales PDF and logarithmic filling rate", "topics": "crv integration logarithms", "marks": "10 marks", "body": "<p>The weekly volume of petrol sold, $X$, in units of 10 000 L, has PDF $f(x)=5(1-x)^4$ for $0\\leq x\\leq1$.</p>\n<div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the expected value and variance of the amount of fuel sold in a week, using appropriate units.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find the storage capacity needed so there is only a 1% chance of running out of petrol.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">If $h'(t)=\\dfrac5{2t+3}$, determine the height of the tank if it takes 20 minutes to fill.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["For (a), compute $E(X)=\\int_0^1xf(x)dx$ and $E(X^2)=\\int_0^1x^2f(x)dx$.", "For (b), use $P(X\\gt c)=0.01$. The survival function is $(1-c)^5$.", "For (c), integrate the rate over $0\\leq t\\leq20$."], "hints": ["Remember $X$ is in units of 10 000 L, so convert at the end.", "Running out means demand exceeds capacity.", "$\\int \\frac5{2t+3}dt=\\frac52\\ln(2t+3)+C$."], "solutions": [{"label": "a", "html": "$E(X)=\\frac16$, so the expected fuel sold is $\\frac{10000}{6}\\approx1667$ L. $Var(X)=\\frac5{252}$ in squared units, so the variance in litres is $10000^2\\cdot\\frac5{252}\\approx1.98\\times10^6\\text{ L}^2$."}, {"label": "b", "html": "$P(X\\gt c)=(1-c)^5=0.01$. Hence $c=1-0.01^{1/5}\\approx0.6019$, so capacity $\\approx6019$ L."}, {"label": "c", "html": "Height $=\\int_0^{20}\\frac5{2t+3}dt=\\frac52\\ln\\left(\\frac{43}{3}\\right)\\approx6.66$ m."}], "source": "2022 WACE"}, {"id": 13, "year": "2022", "section": "Calculator-Assumed", "title": "Question 9 — Lucky Cup binomial game", "topics": "probability drv", "marks": "14 marks", "body": "<p>Three standard dice are rolled and $X$ is the number of sixes obtained.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(b)</div><div class=\"wace-part-text\">State the distribution of $X$ and complete its probability table.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(d)</div><div class=\"wace-part-text\">The game costs $1$; rolling $x$ sixes pays $x$ dollars. Determine expected school profit/loss and the probability the player makes a profit.</div><div class=\"wace-part-marks\">5 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)–(f)</div><div class=\"wace-part-text\">A modified game pays only for two or three target values. Determine the required top prize and explain whether choosing a random target changes the chance of winning.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["A die either shows a six or does not, so use a binomial distribution with $n=3$ and $p=1/6$.", "Expected school profit = entry fee minus expected payout.", "In the modified game, let the payout for two sixes be $a$ and for three sixes be $3a$."], "hints": ["Use $P(X=x)=\\binom3x(1/6)^x(5/6)^{3-x}$.", "Player profit requires payout greater than the $1 entry cost.", "A random target is still one face out of six, so the success probability per die is unchanged."], "solutions": [{"label": "a-b", "html": "$X\\sim B(3,\\frac16)$. Probabilities: $P(0)=\\frac{125}{216}$, $P(1)=\\frac{75}{216}$, $P(2)=\\frac{15}{216}$, $P(3)=\\frac1{216}$."}, {"label": "c", "html": "Since the payout equals $X$ dollars, $E(\\text{payout})=E(X)=3\\cdot\\frac16=\\frac12$. School profit per game $=1-\\frac12=\\$0.50$."}, {"label": "d", "html": "The player makes a profit only if payout $>1$, so $X=2$ or $3$. Probability $=\\frac{15+1}{216}=\\frac{2}{27}$."}, {"label": "e", "html": "Let payout for two sixes be $a$, so payout for three sixes is $3a$. Expected payout $=a\\frac{15}{216}+3a\\frac1{216}=\\frac{a}{12}$. Required school profit per game is $200/500=0.40$, so $1-\\frac{a}{12}=0.40$, giving $a=7.20$. Top prize $=3a=\\$21.60$."}, {"label": "f", "html": "The target value is still just one of six possible die faces. Therefore the chance of matching the target on each die remains $1/6$, so the chance of winning is unchanged."}], "source": "2022 WACE"}, {"id": 14, "year": "2022", "section": "Calculator-Assumed", "title": "Question 10 — damped spring motion", "topics": "differentiation kinematics exponential", "marks": "9 marks", "body": "<p>The displacement of a damped spring is $x(t)=3e^{-t}\\sin t$, for $t\\geq0$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine when the mass first returns to its starting position.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine an expression for velocity.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Determine the displacement when it first changes direction.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Find when the amplitude $A(t)=3e^{-t}$ drops to $0.01$ cm.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Starting position is $x=0$; solve $3e^{-t}\\sin t=0$.", "Velocity is the derivative of displacement; use product rule.", "A change of direction occurs when velocity is zero."], "hints": ["Since $e^{-t}$ is never zero, zeros come from $\\sin t$.", "For $e^{-t}\\sin t$, differentiate both factors.", "Solve $3e^{-t}=0.01$ using natural logarithms."], "solutions": [{"label": "a", "html": "$x(t)=0$ when $\\sin t=0$. The first return after $t=0$ is $t=\\pi$ seconds."}, {"label": "b", "html": "$v(t)=x'(t)=3e^{-t}(\\cos t-\\sin t)$."}, {"label": "c", "html": "Set $v(t)=0$: $\\cos t=\\sin t$, so the first positive solution is $t=\\frac\\pi4$. Displacement $=3e^{-\\pi/4}\\sin(\\pi/4)=\\frac{3\\sqrt2}{2}e^{-\\pi/4}$ cm."}, {"label": "d", "html": "$3e^{-t}=0.01\\Rightarrow e^{-t}=\\frac1{300}\\Rightarrow t=\\ln(300)\\approx5.70$ s."}], "source": "2022 WACE"}, {"id": 15, "year": "2022", "section": "Calculator-Assumed", "title": "Question 11 — sprint velocity, acceleration and displacement", "topics": "differentiation integration kinematics exponential", "marks": "11 marks", "body": "<p>The velocity of a sprinter is $v(t)=-10e^{-0.8t}-0.05e^{0.2t}+10.05$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine acceleration after 3 seconds.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine the maximum velocity and when it is achieved.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Find displacement $x(t)$ if $x(0)=0$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Determine when the athlete finishes the 100 m race.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Acceleration is $a(t)=v'(t)$.", "Maximum velocity occurs when acceleration is zero and changes sign.", "Displacement is the integral of velocity; then solve $x(t)=100$."], "hints": ["Differentiate exponentials using the chain rule.", "This is calculator-assumed, so numerical solving is allowed.", "Use $x(0)=0$ to determine the integration constant."], "solutions": [{"label": "a", "html": "$a(t)=8e^{-0.8t}-0.01e^{0.2t}$, so $a(3)\\approx0.708\\text{ m/s}^2$."}, {"label": "b", "html": "Solve $8e^{-0.8t}-0.01e^{0.2t}=0$, giving $t=\\ln(800)\\approx6.685$ s. Maximum velocity $v(6.685)\\approx9.81$ m/s."}, {"label": "c", "html": "$x(t)=12.5e^{-0.8t}-0.25e^{0.2t}+10.05t+C$. Since $x(0)=0$, $C=-12.25$."}, {"label": "d", "html": "Solve $12.5e^{-0.8t}-0.25e^{0.2t}+10.05t-12.25=100$. This gives $t\\approx11.41$ s."}], "source": "2022 WACE"}, {"id": 16, "year": "2022", "section": "Calculator-Assumed", "title": "Question 12 — normal distribution and confidence intervals", "topics": "normal confidence sampling probability", "marks": "16 marks", "body": "<p>Rod lengths are normally distributed with mean $400$ cm and standard deviation $5$ cm. A rod is useable if $395\\leq X\\leq405$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find the probability a rod is useable.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)–(d)</div><div class=\"wace-part-text\">Use sample proportion conditions, approximate distribution, and calculate a 95% CI from 75 successes in 100 rods.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)–(g)</div><div class=\"wace-part-text\">Reduce margin of error, find a required sample size for maximum possible margin $0.05$, and interpret a CI $(0.717,0.803)$ against a claim of $80\\%$.</div><div class=\"wace-part-marks\">7 marks</div></div></div>", "breakdown": ["Convert 395 and 405 to z-scores.", "For the sample proportion, use $\\hat p\\approx N\\left(p,\\frac{p(1-p)}n\\right)$ when conditions are met.", "The maximum margin of error uses $\\hat p=0.5$."], "hints": ["$395$ and $405$ are one standard deviation below and above the mean.", "For a 95% CI, use $z^*=1.96$.", "A claim is not contradicted if the claimed value lies inside the confidence interval."], "solutions": [{"label": "a", "html": "$P(395\\leq X\\leq405)=P(-1\\leq Z\\leq1)\\approx0.683$."}, {"label": "b-c", "html": "The normal approximation for $\\hat p$ requires large counts, usually $np\\geq10$ and $n(1-p)\\geq10$. If $p=0.8,n=100$, then $\\hat p\\approx N(0.8,0.0016)$."}, {"label": "d", "html": "$\\hat p=0.75$. A 95% CI is $0.75\\pm1.96\\sqrt{\\frac{0.75(0.25)}{100}}=(0.665,0.835)$ approximately."}, {"label": "e", "html": "To reduce margin of error: increase sample size, or use a lower confidence level."}, {"label": "f", "html": "$1.96\\sqrt{0.25/n}\\leq0.05\\Rightarrow n\\geq384.16$, so $n=385$."}, {"label": "g", "html": "The claim $p=0.80$ is inside $(0.717,0.803)$, so the interval does not provide evidence that the useable proportion is different from the claimed $80\\%$."}], "source": "2022 WACE"}, {"id": 17, "year": "2022", "section": "Calculator-Assumed", "title": "Question 13 — sample proportions, bias and reverse confidence interval", "topics": "sampling confidence normal probability", "marks": "12 marks", "body": "<p>In Melbourne, $35\\%$ of people purchase free-range eggs.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">For a random sample of 100 people, find $P(\\hat p\\lt0.28)$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Identify and explain two sources of bias in a proposed convenience sample outside one shop at 9–10 am Tuesday.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(d)</div><div class=\"wace-part-text\">A random Perth sample of $243$ gives CI $(0.2520,0.3488)$. Determine the number who purchase free-range eggs and the confidence level used.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Use the normal approximation for $\\hat p$ with mean $p=0.35$ and standard deviation $\\sqrt{p(1-p)/n}$.", "Bias comes from who is included and who is excluded by the sampling method.", "The centre of a confidence interval is $\\hat p$; the half-width is the margin of error."], "hints": ["A sample outside one shop at one time is not representative of a whole city.", "$\\hat p$ times $n$ gives the number of successes.", "Use $E=z^*\\sqrt{\\hat p(1-\\hat p)/n}$ to recover $z^*$."], "solutions": [{"label": "a", "html": "$\\hat p\\approx N\\left(0.35,\\frac{0.35(0.65)}{100}\\right)$. $z=\\dfrac{0.28-0.35}{\\sqrt{0.35(0.65)/100}}\\approx-1.47$, so $P(\\hat p\\lt0.28)\\approx0.071$."}, {"label": "b", "html": "Possible biases: the location samples only shoppers at one shop, and the time/day excludes people who do not shop then. It is a convenience sample and may not represent all Perth residents."}, {"label": "c", "html": "Midpoint $\\hat p=\\dfrac{0.2520+0.3488}{2}=0.3004$. Number $=0.3004\\times243\\approx73$ people."}, {"label": "d", "html": "Margin $E=0.0484$. With $\\hat p=73/243$, $z^*=\\dfrac{0.0484}{\\sqrt{\\hat p(1-\\hat p)/243}}\\approx1.646$, corresponding to approximately a $90\\%$ confidence level."}], "source": "2022 WACE"}, {"id": 18, "year": "2022", "section": "Calculator-Assumed", "title": "Question 14 — exponential decay and logarithmic linearisation", "topics": "logarithms", "marks": "13 marks", "body": "<p>Light intensity through soft tissue is modelled by $I=I_0e^{-0.75x}$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(b)</div><div class=\"wace-part-text\">Find the percentage remaining after $1$ cm and the distance for the intensity to reach one quarter of its initial value.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(d)</div><div class=\"wace-part-text\">Determine $\\ln(I/I_0)$ and use a straight-line graph to identify an attenuation constant $\\mu$.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)</div><div class=\"wace-part-text\">Express $I=I_010^{-bx}$ and interpret the distance $1/b$ cm.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["For (a), compute $e^{-0.75}\\times100\\%$.", "Taking natural logs gives $\\ln(I/I_0)=-0.75x$.", "To write in base 10, use $10^{-bx}=e^{-b x\\ln10}$."], "hints": ["“One quarter” means $I/I_0=1/4$.", "The slope of a graph of $\\ln(I/I_0)$ against $x$ is $-\\mu$.", "$1/b$ makes the power of 10 equal to $-1$."], "solutions": [{"label": "a", "html": "After $1$ cm, $I/I_0=e^{-0.75}\\approx0.472$, so about $47.2\\%$ remains."}, {"label": "b", "html": "$e^{-0.75x}=\\frac14\\Rightarrow x=\\dfrac{\\ln4}{0.75}\\approx1.85$ cm."}, {"label": "c", "html": "$\\ln(I/I_0)=\\ln(e^{-0.75x})=-0.75x$, a straight line through the origin with gradient $-0.75$."}, {"label": "d", "html": "From the supplied straight-line graph, the gradient is about $-0.5$, so $\\mu=0.5$."}, {"label": "e", "html": "Since $e^{-0.75x}=10^{-bx}$, $b\\ln10=0.75$, so $b=0.75/\\ln10\\approx0.326$. Over $1/b$ cm, $I=I_010^{-1}=0.1I_0$, so intensity becomes one tenth of its original value."}], "source": "2022 WACE"}, {"id": 19, "year": "2022", "section": "Calculator-Assumed", "title": "Question 15 — FTC with variable upper limit and increments", "topics": "integration differentiation", "marks": "5 marks", "body": "<p>An object moves along $y=\\sqrt3\\sin x$. Its distance travelled is</p><div class=\"key-formula\">$$D(t)=\\int_0^{\\pi t}\\sqrt{1+3\\cos^2x}\\,dx.$$</div><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the speed $s=\\dfrac{dD}{dt}$ when $t=1$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Use increments to estimate the distance travelled between $t=1$ and $t=1.02$.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Use the FTC with upper limit $\\pi t$: substitute $\\pi t$ into the integrand and multiply by $\\pi$.", "At $t=1$, $\\cos(\\pi)=-1$.", "The increments formula gives $\\delta D\\approx\\dfrac{dD}{dt}\\delta t$."], "hints": ["Do not try to evaluate the integral directly.", "The chain rule factor is the derivative of $\\pi t$, which is $\\pi$.", "Here $\\delta t=0.02$."], "solutions": [{"label": "a", "html": "$\\dfrac{dD}{dt}=\\sqrt{1+3\\cos^2(\\pi t)}\\cdot\\pi$. At $t=1$, this is $\\pi\\sqrt{1+3(1)}=2\\pi$ m/s."}, {"label": "b", "html": "$\\delta D\\approx(2\\pi)(0.02)=0.04\\pi\\approx0.126$ m."}], "source": "2022 WACE"}];

const WACE_2021_QUESTIONS = [{"id": 20, "year": "2021", "section": "Calculator-Free", "title": "Question 1 — derivatives, logarithmic rate and exponential antiderivative", "topics": "differentiation logarithms integration", "marks": "9 marks", "body": "<p>Answer each part.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Differentiate $3x+\\dfrac{1}{x^3}$ and simplify.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Let $f'(x)=x\\ln(2x)$. Determine a simplified expression for the rate of change of $f'(x)$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Given $g'(x)=4e^{2x}$ and $g(1)=0$, determine $g(5)$.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Rewrite $\\dfrac1{x^3}$ as $x^{-3}$ before differentiating.", "The rate of change of $f'(x)$ is $f''(x)$, so differentiate $x\\ln(2x)$ using the product rule.", "For $g$, integrate $g'(x)$ first, then use $g(1)=0$ to find the constant."], "hints": ["Use the power rule on $x^{-3}$.", "For $\\ln(2x)$, the derivative is $\\dfrac1x$.", "The antiderivative of $4e^{2x}$ is $2e^{2x}+c$."], "solutions": [{"label": "a", "html": "$\\dfrac{d}{dx}\\left(3x+x^{-3}\\right)=3-3x^{-4}=3-\\dfrac3{x^4}$."}, {"label": "b", "html": "$f''(x)=1\\cdot\\ln(2x)+x\\cdot\\dfrac1x=\\ln(2x)+1$."}, {"label": "c", "html": "$g(x)=2e^{2x}+c$. Since $g(1)=0$, $0=2e^2+c$, so $c=-2e^2$. Hence $g(5)=2e^{10}-2e^2=2(e^{10}-e^2)$."}], "source": "2021 WACE"}, {"id": 21, "year": "2021", "section": "Calculator-Free", "title": "Question 2 — uniform continuous distribution", "topics": "crv probability", "marks": "10 marks", "body": "<p>Nahyun's arrival time $X$ is uniformly distributed between $15$ and $40$ minutes after 8:00 am.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Name this type of distribution.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine the endpoints, the PDF height, $E(X)$, and $P(X\\lt25)$.</div><div class=\"wace-part-marks\">5 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Given she is not late for an 8:28 am class, find the probability she arrives after 8:25 am.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">If she wants to be late at most $4\\%$ of the time, what time should she leave home?</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["A uniform distribution has constant density over the interval.", "Translate times after 8:00 am directly into the interval endpoints.", "For part (d), leaving earlier shifts the whole arrival interval earlier by the same number of minutes."], "hints": ["Uniform means height $=1/(b-a)$.", "Not late means $X\\leq28$.", "At most $4\\%$ late means only $4\\%$ of the uniform interval lies beyond 28 minutes."], "solutions": [{"label": "a", "html": "It is a <strong>continuous uniform distribution</strong>."}, {"label": "b", "html": "$p=15$, $q=40$, and $k=\\dfrac1{40-15}=\\dfrac1{25}$. Also $E(X)=\\dfrac{15+40}{2}=27.5$ minutes and $P(X\\lt25)=\\dfrac{25-15}{25}=0.4$."}, {"label": "c", "html": "$P(X\\gt25\\mid X\\leq28)=\\dfrac{P(25\\lt X\\leq28)}{P(X\\leq28)}=\\dfrac{3/25}{13/25}=\\dfrac3{13}$."}, {"label": "d", "html": "If she leaves $s$ minutes earlier, require $P(X-s\\gt28)\\leq0.04$. So $\\dfrac{40-(28+s)}{25}\\leq0.04$, giving $s\\geq11$. She should leave at <strong>7:49 am</strong> or earlier."}], "source": "2021 WACE"}, {"id": 22, "year": "2021", "section": "Calculator-Free", "title": "Question 3 — increments with natural logarithms", "topics": "logarithms differentiation", "marks": "3 marks", "body": "<p>Given $\\ln(2)\\approx0.693$, use the increments formula to approximate $\\ln(2.02)$.</p>", "breakdown": ["Use $y=\\ln x$, so $\\dfrac{dy}{dx}=\\dfrac1x$.", "The change from $2$ to $2.02$ is $\\delta x=0.02$."], "hints": ["The increments formula is $\\delta y\\approx\\dfrac{dy}{dx}\\delta x$.", "Evaluate the derivative at $x=2$."], "solutions": [{"label": "solution", "html": "For $y=\\ln x$, $\\dfrac{dy}{dx}=\\dfrac1x$. At $x=2$, $\\delta y\\approx\\dfrac12(0.02)=0.01$. Hence $\\ln(2.02)\\approx0.693+0.01=0.703$."}], "source": "2021 WACE"}, {"id": 23, "year": "2021", "section": "Calculator-Free", "title": "Question 4 — integrals and FTC", "topics": "integration logarithms", "marks": "7 marks", "body": "<div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine $\\displaystyle\\int(2x^2-x^3)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine $\\displaystyle\\int_0^{\\pi/2}\\dfrac{\\sin x}{3-\\cos x}\\,dx$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Determine $\\dfrac{d}{dy}\\displaystyle\\int_{-1}^{y}3x^2\\cos(2x)\\,dx$.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Part (a) is a direct power-rule integral.", "For part (b), use $u=3-\\cos x$ because $du=\\sin x\\,dx$.", "For part (c), use the Fundamental Theorem of Calculus: differentiating an integral with upper limit $y$ returns the integrand at $y$."], "hints": ["Remember the constant $+c$ in an indefinite integral.", "Change the limits when using substitution: at $x=0$, $u=2$; at $x=\\pi/2$, $u=3$.", "Substitute $x=y$ into the integrand."], "solutions": [{"label": "a", "html": "$\\int(2x^2-x^3)dx=\\dfrac{2x^3}{3}-\\dfrac{x^4}{4}+c$."}, {"label": "b", "html": "Let $u=3-\\cos x$, so $du=\\sin x\\,dx$. The limits change from $u=2$ to $u=3$. Hence the integral is $\\int_2^3\\dfrac1u\\,du=\\ln3-\\ln2=\\ln\\left(\\dfrac32\\right)$."}, {"label": "c", "html": "$\\dfrac{d}{dy}\\int_{-1}^{y}3x^2\\cos(2x)dx=3y^2\\cos(2y)$."}], "source": "2021 WACE"}, {"id": 24, "year": "2021", "section": "Calculator-Free", "title": "Question 5 — area between a parabola and a line", "topics": "integration", "marks": "6 marks", "body": "<div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the area between $y=x^2-x+3$ and $y=x+3$.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Explain why the area between $y=x^2-x-2$ and $y=x-2$ is the same.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Find intersections first by setting the two equations equal.", "Area between curves is $\\int(\\text{top} - \\text{bottom})dx$.", "For part (b), compare the vertical difference between the two functions."], "hints": ["The intersections occur where $x^2-x+3=x+3$.", "On the interval between the intersections, the line is above the parabola.", "Both curves in part (b) have been shifted down by the same amount."], "solutions": [{"label": "a", "html": "Solve $x^2-x+3=x+3$, giving $x^2-2x=0$, so $x=0,2$. The area is $\\int_0^2[(x+3)-(x^2-x+3)]dx=\\int_0^2(2x-x^2)dx=[x^2-\\frac{x^3}{3}]_0^2=\\frac43$."}, {"label": "b", "html": "The vertical difference is unchanged: $(x-2)-(x^2-x-2)=2x-x^2$, the same as in part (a). Therefore the enclosed area is also $\\frac43$."}], "source": "2021 WACE"}, {"id": 25, "year": "2021", "section": "Calculator-Free", "title": "Question 6 — normal distribution features and discrete vs continuous", "topics": "normal probability", "marks": "7 marks", "body": "<p>This question uses graphs of normal distributions and a comparison with a distribution where $P(Y\\geq2)\\gt P(Y\\gt2)$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Read the mean and compare standard deviations from normal curves.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Shade and judge a region corresponding to $P(6\\leq X\\leq9)$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Explain whether $P(Y\\geq2)\\gt P(Y\\gt2)$ is possible for a normal or binomial distribution.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["For a normal curve, the mean is at the centre/peak of the symmetric curve.", "Larger standard deviation means the curve is wider and flatter.", "The difference between $P(Y\\geq2)$ and $P(Y\\gt2)$ is $P(Y=2)$."], "hints": ["A continuous normal distribution has zero probability at a single exact value.", "A binomial distribution can have positive probability at a single integer.", "Use the graph symmetry to judge whether a shaded interval is more than half."], "solutions": [{"label": "a", "html": "The mean is read from the centre of the relevant normal curve. The distribution with the widest, flattest curve has the largest standard deviation."}, {"label": "b", "html": "Shade the area under the curve between $x=6$ and $x=9$. Whether it exceeds $0.5$ depends on whether the interval captures more than half the central area shown by the graph."}, {"label": "c", "html": "$P(Y\\geq2)-P(Y\\gt2)=P(Y=2)$. For a normal distribution this is $0$, so the inequality is not possible. For a binomial distribution it can be positive, so it is possible."}], "source": "2021 WACE"}, {"id": 26, "year": "2021", "section": "Calculator-Free", "title": "Question 7 — area under $1/x$ and logarithmic bounds", "topics": "logarithms integration", "marks": "9 marks", "body": "<p>Use the graph of $f(x)=\\dfrac1x$ to reason about areas and logarithms.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Identify regions with area $\\ln2$ and determine the relationship between $a$ and $b$ if $\\displaystyle\\int_a^b\\dfrac1x\\,dx=\\ln3$.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Use rectangle bounds to show $\\dfrac{11}{30}\\lt\\displaystyle\\int_2^3\\dfrac1x\\,dx\\lt\\dfrac9{20}$, and hence bound $\\ln(1.5)$.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Use $\\int_a^b\\frac1x dx=\\ln b-\\ln a=\\ln(b/a)$.", "Areas such as $\\int_1^2\\frac1x dx$ and $\\int_2^4\\frac1x dx$ both equal $\\ln2$.", "Rectangle estimates compare left/right endpoint heights against the decreasing curve."], "hints": ["For $\\ln3$, set $\\ln(b/a)=\\ln3$.", "$\\int_2^3\\frac1x dx=\\ln(3/2)=\\ln(1.5)$.", "A decreasing curve has left rectangles above the curve and right rectangles below it."], "solutions": [{"label": "a", "html": "Examples of regions with area $\\ln2$ are $\\int_1^2\\frac1x dx$ and $\\int_2^4\\frac1x dx$. If $\\int_a^b\\frac1x dx=\\ln3$, then $\\ln(b/a)=\\ln3$, so $b=3a$."}, {"label": "b", "html": "Using the displayed rectangles gives the lower and upper sums $\\dfrac{11}{30}$ and $\\dfrac9{20}$. Since $\\int_2^3\\frac1x dx=\\ln(3/2)=\\ln(1.5)$, it follows that $\\dfrac{11}{30}\\lt\\ln(1.5)\\lt\\dfrac9{20}$."}], "source": "2021 WACE"}, {"id": 27, "year": "2021", "section": "Calculator-Assumed", "title": "Question 8 — normal distribution and binomial count", "topics": "normal probability", "marks": "9 marks", "body": "<p>Carrot weights are normally distributed: $W\\sim N(142.8,30.6^2)$ grams.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find the percentage weighing more than $155$ g.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Complete a classification table with cut-offs $110$, $155$, and $210$ grams.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Of carrots that are not medium, find the proportion that are small.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">For bags of $12$ carrots, find the probability of at most two small carrots.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Standardise using $Z=\\dfrac{W-142.8}{30.6}$.", "Use normal CDF differences to fill the probability table.", "The bag count is binomial once the probability of a small carrot is known."], "hints": ["“Not medium” means use $1-P(\\text{medium})$ in the denominator.", "At most two means $0$, $1$, or $2$.", "Use $X\\sim B(12,p_{small})$."], "solutions": [{"label": "a", "html": "$z=\\dfrac{155-142.8}{30.6}\\approx0.399$, so $P(W\\gt155)\\approx0.345$, or about $34.5\\%$."}, {"label": "b", "html": "$P(W\\leq110)\\approx0.1419$, $P(110\\lt W\\leq155)\\approx0.5131$, $P(155\\lt W\\leq210)\\approx0.3310$, and $P(W\\gt210)\\approx0.0140$."}, {"label": "c", "html": "$P(\\text{small}\\mid\\text{not medium})=\\dfrac{0.1419}{1-0.5131}\\approx0.291$."}, {"label": "d", "html": "Let $X\\sim B(12,0.1419)$. Then $P(X\\leq2)\\approx0.763$."}], "source": "2021 WACE"}, {"id": 28, "year": "2021", "section": "Calculator-Assumed", "title": "Question 9 — trigonometric building model and optimisation", "topics": "differentiation applications", "marks": "8 marks", "body": "<p>The building height is $h(x)=4\\sin(x-\\frac{3\\pi}{2})-x^2+3\\pi x-4$ for $0\\leq x\\leq W$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the width $W$ of the building.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine $h'(x)$.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Find where the building height is maximum and state the height.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Find the height of a rest platform placed where the second half of the climb is steepest.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Use $\\sin(x-3\\pi/2)=\\cos x$ to simplify the model if helpful.", "The width occurs at the positive intercept where $h(W)=0$.", "Maximum height is found by solving $h'(x)=0$ and checking it gives a maximum."], "hints": ["A CAS/calculator is appropriate for the numerical root in part (a).", "$h'(x)=4\\cos(x-3\\pi/2)-2x+3\\pi$.", "Steepest positive climb is where $h'$ is largest, so examine $h''(x)=0$ on the relevant part of the climb."], "solutions": [{"label": "a", "html": "Solving $h(x)=0$ for the positive intercept gives $W\\approx8.64$ m, to the nearest centimetre."}, {"label": "b", "html": "$h'(x)=4\\cos(x-\\frac{3\\pi}{2})-2x+3\\pi=-4\\sin x-2x+3\\pi$."}, {"label": "c", "html": "Solving $h'(x)=0$ gives $x\\approx5.74$ m. The maximum height is $h(5.74)\\approx20.57$ m."}, {"label": "d", "html": "The steepest point on the relevant climbing section occurs where the gradient is locally greatest. Using $h''(x)=-4\\cos x-2=0$ gives the relevant point $x=\\frac{4\\pi}{3}$, and $h(4\\pi/3)\\approx15.93$ m."}], "source": "2021 WACE"}, {"id": 29, "year": "2021", "section": "Calculator-Assumed", "title": "Question 10 — sample proportions with scratchie tickets", "topics": "sampling probability", "marks": "8 marks", "body": "<p>At a fundraising event, $400$ scratchie tickets are purchased and prizes are won $124$ times. The theoretical probability of winning is $p=\\dfrac7{24}$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the sample proportion of wins.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Show that the theoretical probability of winning is $\\dfrac7{24}$.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Calculate the mean and standard deviation of the sample proportion for $400$ tickets.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">If a second sample proportion is $0.6$ standard deviations above the population proportion, how many prizes were won?</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Sample proportion is wins divided by total trials.", "For a sample proportion, $E(\\hat p)=p$ and $SD(\\hat p)=\\sqrt{p(1-p)/n}$.", "Convert the sample proportion back to a count by multiplying by $400$."], "hints": ["Use the ticket sample space to justify the theoretical probability.", "Keep enough decimal places before multiplying by $400$.", "The observed first-event proportion $124/400=0.31$ is close to the above-population direction."], "solutions": [{"label": "a", "html": "$\\hat p=\\dfrac{124}{400}=0.31$."}, {"label": "b", "html": "Counting the equally likely outcomes from the ticket panels gives $7$ winning outcomes out of $24$, so $p=\\dfrac7{24}$."}, {"label": "c", "html": "$E(\\hat p)=\\dfrac7{24}\\approx0.2917$ and $SD(\\hat p)=\\sqrt{\\dfrac{(7/24)(17/24)}{400}}\\approx0.0227$."}, {"label": "d", "html": "$\\hat p\\approx0.2917+0.6(0.0227)=0.3053$. Expected number of prizes $=400(0.3053)\\approx122$."}], "source": "2021 WACE"}, {"id": 30, "year": "2021", "section": "Calculator-Assumed", "title": "Question 11 — sample proportions and confidence intervals", "topics": "sampling confidence probability", "marks": "17 marks", "body": "<p>Researchers believe $23\\%$ of voters support a political party. Samples are taken one year before and one week before an election.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(b)</div><div class=\"wace-part-text\">State the distribution of $\\hat p$ for samples of $400$ and find $P(\\hat p\\lt0.20)$.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(e)</div><div class=\"wace-part-text\">A sample of $200$ has $55$ supporters. Estimate $p$, find a 99% margin of error, and calculate a 95% confidence interval.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(f)–(g)</div><div class=\"wace-part-text\">Use the interval to judge whether support increased, and discuss binomial assumptions.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["For large samples, $\\hat p\\approx N(p,p(1-p)/n)$.", "The point estimate is $55/200$.", "A confidence interval gives a range of plausible population proportions."], "hints": ["Use $z=\\dfrac{0.20-0.23}{\\sqrt{0.23(0.77)/400}}$.", "For 99%, use $z^*\\approx2.576$; for 95%, use $z^*\\approx1.96$.", "If $0.23$ lies inside the 95% CI, evidence of increase is not strong."], "solutions": [{"label": "a", "html": "$\\hat p\\approx N\\left(0.23,\\dfrac{0.23(0.77)}{400}\\right)$."}, {"label": "b", "html": "$z=\\dfrac{0.20-0.23}{\\sqrt{0.23(0.77)/400}}\\approx-1.43$, so $P(\\hat p\\lt0.20)\\approx0.077$."}, {"label": "c-d", "html": "$\\hat p=55/200=0.275$. The 99% margin is $2.576\\sqrt{\\dfrac{0.275(0.725)}{200}}\\approx0.081$."}, {"label": "e", "html": "The 95% CI is $0.275\\pm1.96\\sqrt{\\dfrac{0.275(0.725)}{200}}\\approx(0.213,0.337)$."}, {"label": "f", "html": "Since $0.23$ lies inside the 95% interval, the sample does not provide clear evidence that support increased."}, {"label": "g", "html": "Binomial assumptions: fixed sample size, each voter either supports or does not support the party, approximately independent responses from a random sample, and a common support probability within the electorate. Independence and representativeness are the key contextual concerns."}], "source": "2021 WACE"}, {"id": 31, "year": "2021", "section": "Calculator-Assumed", "title": "Question 12 — curve sketching with derivatives", "topics": "differentiation", "marks": "15 marks", "body": "<p>Let $f(x)=x^2e^x$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Show that $f'(x)=xe^x(x+2)$.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find all stationary points and determine their nature.</div><div class=\"wace-part-marks\">7 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(d)</div><div class=\"wace-part-text\">Find points of inflection and sketch the graph, indicating key features.</div><div class=\"wace-part-marks\">6 marks</div></div></div>", "breakdown": ["Use the product rule on $x^2e^x$.", "Since $e^x\\gt0$, the stationary points come from $x(x+2)=0$.", "Find $f''(x)$ to locate inflection points."], "hints": ["Check sign changes of $f'$ around $x=-2$ and $x=0$.", "$f''(x)=e^x(x^2+4x+2)$.", "Inflection occurs where $x^2+4x+2=0$ and concavity changes."], "solutions": [{"label": "a", "html": "$f'(x)=2xe^x+x^2e^x=e^x(2x+x^2)=xe^x(x+2)$."}, {"label": "b", "html": "$f'(x)=0$ gives $x=-2,0$. $f(-2)=4e^{-2}$ and $f(0)=0$. The sign of $x(x+2)$ changes $+,-,+$, so $(-2,4/e^2)$ is a local maximum and $(0,0)$ is a local minimum."}, {"label": "c", "html": "$f''(x)=e^x(x^2+4x+2)$. Solve $x^2+4x+2=0$ to get $x=-2\\pm\\sqrt2$. The inflection points are $(-2-\\sqrt2,(-2-\\sqrt2)^2e^{-2-\\sqrt2})$ and $(-2+\\sqrt2,(-2+\\sqrt2)^2e^{-2+\\sqrt2})$."}, {"label": "d", "html": "The sketch should show the curve non-negative, touching the x-axis at $(0,0)$, a local maximum at $(-2,4/e^2)$, and inflection points at $x=-2\\pm\\sqrt2$."}], "source": "2021 WACE"}, {"id": 32, "year": "2021", "section": "Calculator-Assumed", "title": "Question 13 — binomial game and confidence intervals", "topics": "drv probability confidence", "marks": "14 marks", "body": "<p>A game uses five buckets, each with 5 blue and 15 red balls. A player wins if at least 4 blue balls are selected. Let $X$ be the number of blue balls.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(c)</div><div class=\"wace-part-text\">State the distribution, find the chance of winning, and decide whether a $150$ prize is good for organisers if entry costs $2$.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)–(g)</div><div class=\"wace-part-text\">Use observed confidence intervals $(0.04,0.16)$ and $(0.05,0.15)$ for 100 games to identify the 95% interval, recover wins, predict width for 400 games, and discuss a missed true proportion.</div><div class=\"wace-part-marks\">8 marks</div></div></div>", "breakdown": ["Each bucket gives the same success probability $5/20=0.25$.", "Winning means $X=4$ or $X=5$.", "Higher confidence means a wider interval, all else equal."], "hints": ["Use $X\\sim B(5,0.25)$.", "Expected payout is prize multiplied by win probability.", "The midpoint of a confidence interval is $\\hat p$."], "solutions": [{"label": "a", "html": "$X\\sim B(5,0.25)$."}, {"label": "b", "html": "$P(X\\geq4)=\\binom54(0.25)^4(0.75)+(0.25)^5=0.015625$."}, {"label": "c", "html": "Expected payout is $150(0.015625)=2.34375$, which is greater than the $2$ entry fee. The organisers expect to lose about $0.34$ per play, so it is not a good idea."}, {"label": "d", "html": "The 95% interval is wider, so it is $(0.04,0.16)$."}, {"label": "e", "html": "The midpoint is $0.10$, so wins $=0.10\\times100=10$."}, {"label": "f", "html": "Increasing from 100 to 400 games multiplies $n$ by 4, so the standard error and interval width are halved."}, {"label": "g", "html": "No. A confidence interval is not guaranteed to contain the true value; a certain percentage of intervals miss the parameter even when sampling is done correctly."}], "source": "2021 WACE"}, {"id": 33, "year": "2021", "section": "Calculator-Assumed", "title": "Question 14 — kinematics and acceleration", "topics": "kinematics differentiation", "marks": "5 marks", "body": "<p>The displacement of a power boat is $x(t)=\\dfrac{5t(t^2-15t+48)}6$, $t\\geq0$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">Question</div><div class=\"wace-part-text\">How far has the boat travelled before its acceleration is zero?</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Differentiate displacement to get velocity, then differentiate velocity to get acceleration.", "Solve $a(t)=0$ to find the time limit.", "Distance travelled is not always displacement; split if velocity changes sign."], "hints": ["Check when $v(t)=0$ between $0$ and the acceleration-zero time.", "Velocity changes sign at $t=2$ before $a=0$ at $t=5$.", "Total distance is the sum of lengths of each movement segment."], "solutions": [{"label": "solution", "html": "$x(t)=\\frac56t^3-12.5t^2+40t$, so $v(t)=\\frac52t^2-25t+40$ and $a(t)=5t-25$. Thus $a=0$ at $t=5$. Since $v=0$ at $t=2$ in $[0,5]$, total distance is $[x(2)-x(0)]+[x(2)-x(5)]$. Now $x(2)=\\frac{110}{3}$ and $x(5)=-\\frac{25}{3}$, so distance $=\\frac{110}{3}+\\frac{135}{3}=\\frac{245}{3}$ m."}], "source": "2021 WACE"}, {"id": 34, "year": "2021", "section": "Calculator-Assumed", "title": "Question 15 — logarithmic graph parameters", "topics": "logarithms", "marks": "4 marks", "body": "<p>The graph of $y=m\\log_3(x-p)+q$ has vertical asymptote $x=5$ and passes through $(6,2)$ and $(14,-6)$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Explain why $p=5$.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine $m$ and $q$.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["For $\\log_3(x-p)$, the input is zero at $x=p$, so the vertical asymptote is $x=p$.", "Substitute the two given points after setting $p=5$."], "hints": ["At $x=6$, $\\log_3(1)=0$.", "At $x=14$, $\\log_3(9)=2$."], "solutions": [{"label": "a", "html": "The logarithm is undefined when $x-p=0$, so the vertical asymptote is $x=p$. Since the asymptote is $x=5$, $p=5$."}, {"label": "b", "html": "Using $(6,2)$: $2=m\\log_3(1)+q=q$, so $q=2$. Using $(14,-6)$: $-6=m\\log_3(9)+2=2m+2$, so $m=-4$."}], "source": "2021 WACE"}, {"id": 35, "year": "2021", "section": "Calculator-Assumed", "title": "Question 16 — logarithmic profit model and exponential follow-up", "topics": "logarithms differentiation", "marks": "12 marks", "body": "<p>A company profit model is $P(x)=\\dfrac{20\\ln(x+a)}{x+5}$, where $P$ is in millions of dollars. Initially $P(0)=4$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(b)</div><div class=\"wace-part-text\">Show $a=e$ and find the predicted profit after 5 weeks.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(e)</div><div class=\"wace-part-text\">Use the quotient rule to find the equation for maximum profit, then determine the maximum and when profit falls below its initial value.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(f)</div><div class=\"wace-part-text\">A later model is $N(y)=2e^{b(10+y)}$. Use continuity at week 10 to determine when profit exceeds $5$ million.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Use $P(0)=4$ to find $a$.", "Use quotient rule for $P'(x)$.", "For the second model, use the known week-10 value to determine $b$."], "hints": ["After $a=e$, $P(x)=20\\ln(x+e)/(x+5)$.", "The maximum occurs when the numerator of $P'(x)$ is zero.", "Solve $N(y)>5$ after finding $b$."], "solutions": [{"label": "a", "html": "$P(0)=\\dfrac{20\\ln a}{5}=4\\ln a$. Since $P(0)=4$, $\\ln a=1$, so $a=e$."}, {"label": "b", "html": "$P(5)=\\dfrac{20\\ln(5+e)}{10}=2\\ln(5+e)\\approx4.09$ million."}, {"label": "c", "html": "$P'(x)=\\dfrac{20\\left(\\frac{x+5}{x+e}-\\ln(x+e)\\right)}{(x+5)^2}$. The maximum is found by solving $\\dfrac{x+5}{x+e}-\\ln(x+e)=0$."}, {"label": "d", "html": "Solving gives $x\\approx1.79$, with maximum profit $P(1.79)\\approx4.44$ million, during week 2."}, {"label": "e", "html": "Solve $P(x)\\lt4$; the first time after the beginning occurs after about $7.4$ weeks, so during week 8."}, {"label": "f", "html": "Since $N(0)=P(10)\\approx3.391$, $2e^{10b}=3.391$, giving $b\\approx0.0528$. Solving $2e^{b(10+y)}\\gt5$ gives $y\\gt7.36$, so profit exceeds $5$ million during the 18th week from the start of 2021."}], "source": "2021 WACE"}, {"id": 36, "year": "2021", "section": "Calculator-Assumed", "title": "Question 17 — acceleration model for cable car motion", "topics": "kinematics integration", "marks": "8 marks", "body": "<p>A cable car has acceleration $a(t)=kt^2-23t+20k$ m/min$^2$. It starts from rest and after 2 minutes has velocity $18$ m/min.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine $k$.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Once the cable car leaves the mountain station, how long should it take to return to the resort station?</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">If it breaks down 10 minutes into the test, how far is it from the mountain station according to the model?</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Integrate acceleration to get velocity and use $v(0)=0$.", "Use $v(2)=18$ to solve for $k$.", "Turning/stopping times occur when $v(t)=0$."], "hints": ["After finding $k=1.5$, factor the velocity expression.", "The car reaches the mountain station when it first stops after starting.", "Distance from the mountain station is the difference between positions at the mountain-station time and at $t=10$."], "solutions": [{"label": "a", "html": "$v(t)=\\dfrac{k}{3}t^3-\\dfrac{23}{2}t^2+20kt$. Using $v(2)=18$ gives $\\dfrac{8k}{3}-46+40k=18$, so $k=\\dfrac32$."}, {"label": "b", "html": "With $k=\\dfrac32$, $v(t)=\\frac12t^3-\\frac{23}{2}t^2+30t=\\frac12t(t-3)(t-20)$. The car reaches the mountain station at $t=3$ and the resort at $t=20$, so the return trip takes $17$ minutes."}, {"label": "c", "html": "Position from the starting point is $s(t)=\\frac18t^4-\\frac{23}{6}t^3+15t^2$. Thus $s(3)=41.625$ and $s(10)\\approx-1083.33$. The model places the car about $1124.96$ m from the mountain station at $t=10$."}], "source": "2021 WACE"}];



const WACE_2020_QUESTIONS = [
  {
    id: 37,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 1 — spinner binomial distribution",
    topics: "probability drv",
    marks: "6 marks",
    body: `<p>A spinner has one sector labelled B and the probability of landing on B is $\\dfrac14$. The spinner is spun three times. Let $X$ be the number of times B occurs.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Find the probability that B is never obtained.</div><div class="wace-part-marks">1 mark</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Complete the probability distribution for $X=0,1,2,3$.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Determine $E(X)$ and $\\operatorname{Var}(X)$.</div><div class="wace-part-marks">2 marks</div></div></div>`,
    breakdown: ["Recognise repeated spins as binomial trials.", "Use $X\\sim B(3,\\frac14)$.", "Use $P(X=x)={3\\choose x}(\\frac14)^x(\\frac34)^{3-x}$, then apply the binomial mean and variance formulas."],
    hints: ["No B means all three spins are not B.", "The probability of not B is $\\frac34$.", "For $X\\sim B(n,p)$, $E(X)=np$ and $\\operatorname{Var}(X)=np(1-p)$."],
    solutions: [{label:"a", html:"$P(X=0)=(\\frac34)^3=\\frac{27}{64}$."},{label:"b", html:"$P(X=0)=\\frac{27}{64}$, $P(X=1)=3(\\frac14)(\\frac34)^2=\\frac{27}{64}$, $P(X=2)=3(\\frac14)^2(\\frac34)=\\frac{9}{64}$, $P(X=3)=\\frac1{64}$."},{label:"c", html:"$E(X)=3\\times\\frac14=\\frac34$ and $\\operatorname{Var}(X)=3\\times\\frac14\\times\\frac34=\\frac9{16}$."}],
    source: "2020 WACE"
  },
  {
    id: 38,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 2 — quotient rule with exponential and trigonometric functions",
    topics: "differentiation",
    marks: "4 marks",
    body: `<p>If $h(x)=\\dfrac{e^{-x}}{\\cos x}$, evaluate $h'(\\pi)$.</p>`,
    breakdown: ["Use the quotient rule or rewrite $h(x)=e^{-x}\\sec x$.", "Differentiate carefully, remembering the chain rule on $e^{-x}$.", "Substitute $x=\\pi$ using $\\cos\\pi=-1$ and $\\sin\\pi=0$."],
    hints: ["With quotient rule, let $u=e^{-x}$ and $v=\\cos x$.", "$u'=-e^{-x}$ and $v'=-\\sin x$.", "At $x=\\pi$, the sine term disappears."],
    solutions: [{label:"solution", html:"$h'(x)=\\dfrac{(-e^{-x})\\cos x-e^{-x}(-\\sin x)}{\\cos^2x}=\\dfrac{e^{-x}(\\sin x-\\cos x)}{\\cos^2x}$. Hence $h'(\\pi)=\\dfrac{e^{-\\pi}(0-(-1))}{1}=e^{-\\pi}$."}],
    source: "2020 WACE"
  },
  {
    id: 39,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 3 — cubic from turning point and area",
    topics: "integration differentiation",
    marks: "7 marks",
    body: `<p>A cubic $f(x)=ax^3+bx^2+cx+d$ has a turning point at $(1,0)$ and an inflection point on the $y$-axis. The area between the curve and the $x$-axis from $x=0$ to $x=1$ is $\\dfrac32$ square units.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">Question</div><div class="wace-part-text">Use the information to determine $a,b,c$ and $d$.</div><div class="wace-part-marks">7 marks</div></div></div>`,
    breakdown: ["Use $f(1)=0$ because the turning point lies on the curve.", "Use $f'(1)=0$ because the point is stationary.", "Use the inflection information and the area condition to form enough equations."],
    hints: ["If the inflection point is on the $y$-axis, then $f''(0)=0$.", "$f'(x)=3ax^2+2bx+c$ and $f''(x)=6ax+2b$.", "The shaded area condition is $\\int_0^1 |f(x)|\\,dx=\\frac32$; use the sign shown by the graph in the paper."],
    solutions: [{label:"solution", html:"From the graph, the area condition is taken over the signed region below the $x$-axis, so $-\\int_0^1 f(x)\\,dx=\\frac32$. The conditions give $a+b+c+d=0$, $3a+2b+c=0$, and $2b=0$, so $b=0$, $c=-3a$, $d=2a$. Then $-\\int_0^1(a x^3-3ax+2a)dx=\\frac32$, giving $-a(\\frac14-\\frac32+2)=\\frac32$, so $-\\frac34a=\\frac32$ and $a=-2$. Hence $b=0$, $c=6$, $d=-4$."}],
    source: "2020 WACE"
  },
  {
    id: 40,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 4 — relative frequencies and piecewise PDF",
    topics: "crv probability",
    marks: "9 marks",
    body: `<p>A histogram of plant heights gives relative frequencies over height intervals, and a second plant height model has density $d(h)=\\dfrac{h-1}{5}$ for $1\\le h\\le2$, $d(h)=kh^2$ for $2\\lt h\\le4$, and $0$ otherwise.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)–(b)</div><div class="wace-part-text">Use the histogram to answer probability and conditional probability questions.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Find the percentage of hedges with mature height less than $2$ m.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)</div><div class="wace-part-text">Determine $k$.</div><div class="wace-part-marks">3 marks</div></div></div>`,
    breakdown: ["For histogram questions, probability is the sum of relevant relative frequencies.", "For the PDF part, integrate over the required interval.", "Use total area $=1$ to solve for the unknown constant $k$."],
    hints: ["For part (c), calculate $P(1\\le H\\lt2)=\\int_1^2\\frac{h-1}{5}\\,dh$.", "For part (d), set $\\int_1^2\\frac{h-1}{5}\\,dh+\\int_2^4kh^2\\,dh=1$.", "The first integral equals $\\frac1{10}$."],
    solutions: [{label:"c", html:"$P(H\\lt2)=\\int_1^2\\frac{h-1}{5}\\,dh=\\left[\\frac{(h-1)^2}{10}\\right]_1^2=\\frac1{10}$, so $10\\%$."},{label:"d", html:"Total area is $1$, so $\\frac1{10}+k\\left[\\frac{h^3}{3}\\right]_2^4=1$. Thus $k\\cdot\\frac{56}{3}=\\frac9{10}$ and $k=\\frac{27}{560}$."}],
    source: "2020 WACE"
  },
  {
    id: 41,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 5 — derivatives from graphs",
    topics: "differentiation",
    marks: "5 marks",
    body: `<p>The graphs of functions $f$ and $g$ are given in the exam. For this digital version, the required graph readings are: $f'(3)=2$, $f(5)=4$, $g(5)=2$, $f'(5)=-1$, $g'(5)=3$, $g(1)=3$ and $g'(1)=2$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Evaluate $f'(3)$.</div><div class="wace-part-marks">1 mark</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Evaluate $\\dfrac{d}{dx}[f(x)g(x)]$ at $x=5$.</div><div class="wace-part-marks">2 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Evaluate $\\dfrac{d}{dx}[f(g(x))]$ at $x=1$.</div><div class="wace-part-marks">2 marks</div></div></div>`,
    breakdown: ["Read function values and gradients from the given graphs.", "Use the product rule for $f(x)g(x)$.", "Use the chain rule for $f(g(x))$."],
    hints: ["Product rule from graphs: $(fg)'=f'g+fg'$.", "Chain rule from graphs: $(f\\circ g)'(x)=f'(g(x))g'(x)$.", "The key skill is reading slopes and heights accurately from the graph."],
    solutions: [{label:"a", html:"From the graph reading, $f'(3)=2$."},{label:"b", html:"Using the product rule, $(fg)'(5)=f'(5)g(5)+f(5)g'(5)=(-1)(2)+4(3)=10$."},{label:"c", html:"Using the chain rule, $(f\\circ g)'(1)=f'(g(1))g'(1)=f'(3)\\cdot2=2\\cdot2=4$."}],
    source: "2020 WACE"
  },
  {
    id: 42,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 6 — logarithmic transformations",
    topics: "logarithms",
    marks: "7 marks",
    body: `<p>Let $f(x)=\\ln x$. Express each logarithmic function as a transformation of $f$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Write $g(x)=\\ln(4x)$ as $f(x)+a$ and state the vertical translation.</div><div class="wace-part-marks">2 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Write $h(x)=\\ln(\\sqrt{x})$ as a vertical dilation of $f$.</div><div class="wace-part-marks">2 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Write $p(x)=\\ln x+4$ as a horizontal dilation of $f$.</div><div class="wace-part-marks">3 marks</div></div></div>`,
    breakdown: ["Use log laws to rewrite each function in terms of $\\ln x$.", "Vertical translations appear as $f(x)+a$.", "Horizontal dilations appear as $f(bx)$; use $\\ln(bx)=\\ln x+\\ln b$."],
    hints: ["$\\ln(4x)=\\ln4+\\ln x$.", "$\\ln(\\sqrt{x})=\\ln(x^{1/2})=\\frac12\\ln x$.", "For $\\ln x+4=\\ln(e^4x)=f(e^4x)$."],
    solutions: [{label:"a", html:"$g(x)=\\ln(4x)=\\ln x+\\ln4=f(x)+\\ln4$, so it is translated up $\\ln4$ units."},{label:"b", html:"$h(x)=\\ln(x^{1/2})=\\frac12\\ln x=\\frac12f(x)$, a vertical dilation by scale factor $\\frac12$."},{label:"c", html:"$p(x)=\\ln x+4=\\ln(e^4x)=f(e^4x)$, so the horizontal dilation scale factor is $\\frac1{e^4}$."}],
    source: "2020 WACE"
  },
  {
    id: 43,
    year: "2020",
    section: "Calculator-Free",
    title: "Question 7 — exponential curve sketching with derivatives",
    topics: "differentiation logarithms",
    marks: "13 marks",
    body: `<p>Consider $f(x)=e^{2x}-4e^x=e^x(e^x-4)$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Determine the $x$-intercept(s).</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Show there is one turning point at $(\\ln2,-4)$.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)–(d)</div><div class="wace-part-text">Find any inflection point(s) and sketch the curve, labelling key features.</div><div class="wace-part-marks">7 marks</div></div></div>`,
    breakdown: ["Use the factorised form for intercepts.", "Differentiate to locate stationary points.", "Differentiate again to locate inflection points, then assemble the sketch."],
    hints: ["Since $e^x\\ne0$, solve $e^x-4=0$ for the intercept.", "$f'(x)=2e^{2x}-4e^x=2e^x(e^x-2)$.", "$f''(x)=4e^{2x}-4e^x=4e^x(e^x-1)$."],
    solutions: [{label:"a", html:"$e^x(e^x-4)=0$ gives $e^x=4$, so the $x$-intercept is $(\\ln4,0)$."},{label:"b", html:"$f'(x)=2e^x(e^x-2)$, so $f'(x)=0$ at $x=\\ln2$. Then $f(\\ln2)=4-8=-4$. This is the only turning point because $e^x-2$ has only one zero."},{label:"c", html:"$f''(x)=4e^x(e^x-1)$, so $f''(x)=0$ at $x=0$. Then $f(0)=1-4=-3$, giving inflection point $(0,-3)$."}],
    source: "2020 WACE"
  },
  {
    id: 44,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 8 — normal distribution and conditional probability",
    topics: "normal probability",
    marks: "7 marks",
    body: `<p>The weight $X$ of chicken eggs is normally distributed with mean $60$ g and standard deviation $5$ g. Eggs above $67$ g are classed as jumbo.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Find the proportion of eggs that are jumbo.</div><div class="wace-part-marks">2 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Find the proportion of jumbo eggs that are less than $75$ g.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Find the minimum weight of the heaviest $0.05\\%$ of eggs.</div><div class="wace-part-marks">2 marks</div></div></div>`,
    breakdown: ["Standardise using $Z=\\frac{X-60}{5}$.", "Part (b) is conditional: divide by the jumbo probability.", "Part (c) is an inverse-normal upper-tail calculation."],
    hints: ["Jumbo means $X\\gt67$.", "For part (b), calculate $P(67\\lt X\\lt75)/P(X\\gt67)$.", "Heaviest $0.05\\%$ means $P(X\\gt k)=0.0005$."],
    solutions: [{label:"a", html:"$P(X\\gt67)=P(Z\\gt1.4)\\approx0.0808$."},{label:"b", html:"$P(X\\lt75\\mid X\\gt67)=\\dfrac{P(67\\lt X\\lt75)}{P(X\\gt67)}=\\dfrac{\\Phi(3)-\\Phi(1.4)}{1-\\Phi(1.4)}\\approx\\dfrac{0.99865-0.91924}{0.08076}\\approx0.983$."},{label:"c", html:"Solve $P(X\\gt k)=0.0005$. The corresponding $z$ value is about $3.29$, so $k=60+5(3.29)\\approx76.45$ g."}],
    source: "2020 WACE"
  },
  {
    id: 45,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 9 — discrete random variable and expected profit",
    topics: "probability drv",
    marks: "8 marks",
    body: `<p>The number of birthday cakes sold in a day, $X$, has distribution $P(X=0,1,2,3,4)=(0.1,0.2,0.25,0.35,0.1)$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Calculate the mean number sold.</div><div class="wace-part-marks">1 mark</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">If four cakes are made and each costs $20$ to make and sells for $50$, find expected profit/loss.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)–(d)</div><div class="wace-part-text">If three cakes are made and $Y$ is the number unsold, explain $P(Y=0)=0.45$ and obtain the distribution of $Y$.</div><div class="wace-part-marks">4 marks</div></div></div>`,
    breakdown: ["Use $E(X)=\\sum xp(x)$.", "Profit equals revenue minus production cost.", "For three cakes made, unsold cakes are linked to how many are demanded."],
    hints: ["If four are made, sales equal $X$ because demand is never more than 4.", "Profit for $X=x$ is $50x-80$.", "For three cakes made, $Y=0$ if demand is 3 or 4."],
    solutions: [{label:"a", html:"$E(X)=0(0.1)+1(0.2)+2(0.25)+3(0.35)+4(0.1)=2.15$."},{label:"b", html:"Expected revenue is $50E(X)=107.50$ and cost is $4\\times20=80$, so expected profit is $\\$27.50$."},{label:"c", html:"If three cakes are made, none are unsold when demand is 3 or 4, so $P(Y=0)=P(X=3)+P(X=4)=0.35+0.10=0.45$."},{label:"d", html:"$Y=0$ for $X\\ge3$: $0.45$; $Y=1$ for $X=2$: $0.25$; $Y=2$ for $X=1$: $0.20$; $Y=3$ for $X=0$: $0.10$."}],
    source: "2020 WACE"
  },
  {
    id: 46,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 10 — logarithmic total change from a rate",
    topics: "logarithms integration",
    marks: "7 marks",
    body: `<p>The water level in a bowl increases at rate $h'(t)=\\dfrac{4t+1}{2t^2+t+1}$ cm/s.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Find the rate when $t=2$.</div><div class="wace-part-marks">1 mark</div></div><div class="wace-q-part"><div class="wace-part-label">(b)–(c)</div><div class="wace-part-text">Explain why $h(t)=\\ln(2t^2+t+1)+c$ and find the total change over the first $2$ seconds.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)</div><div class="wace-part-text">If the bowl is full at height $\\ln56$ cm and is initially empty, find the filling time.</div><div class="wace-part-marks">3 marks</div></div></div>`,
    breakdown: ["Substitute directly for the instantaneous rate.", "Recognise the numerator is the derivative of the denominator.", "Use an initial condition to solve for $c$, then solve the logarithmic equation."],
    hints: ["$\\frac{d}{dt}(2t^2+t+1)=4t+1$.", "Total change from $0$ to $2$ is $h(2)-h(0)$.", "If initially empty, $h(0)=0$."],
    solutions: [{label:"a", html:"$h'(2)=\\frac{9}{11}$ cm/s."},{label:"b", html:"Since $\\frac{d}{dt}(2t^2+t+1)=4t+1$, integrating $h'(t)$ gives $h(t)=\\ln(2t^2+t+1)+c$."},{label:"c", html:"Change over $0\\le t\\le2$ is $\\ln(11)-\\ln(1)=\\ln11$ cm."},{label:"d", html:"Initially empty gives $h(0)=0$, so $c=0$. Solve $\\ln(2t^2+t+1)=\\ln56$, giving $2t^2+t-55=0$. Thus $t=5$ seconds."}],
    source: "2020 WACE"
  },
  {
    id: 47,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 11 — tangent to exponential and enclosed area",
    topics: "differentiation integration logarithms",
    marks: "9 marks",
    body: `<p>The line $y=x+c$ is tangent to $f(x)=e^x$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)–(c)</div><div class="wace-part-text">Find the tangent point, determine $c$, and sketch the graph and tangent.</div><div class="wace-part-marks">4 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)</div><div class="wace-part-text">Evaluate the exact area between $f(x)$, the tangent, and $x=\\ln2$.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(e)</div><div class="wace-part-text">If $g$ is the inverse of $f$, write a definite integral for a related inverse-function area.</div><div class="wace-part-marks">2 marks</div></div></div>`,
    breakdown: ["Tangency means equal slopes.", "For $e^x$, the derivative is also $e^x$.", "Area between curves is an integral of top minus bottom."],
    hints: ["The tangent line has gradient $1$.", "Solve $e^x=1$ to find the tangent point.", "The tangent is $y=x+1$ and it lies above $e^x$ on the relevant interval."],
    solutions: [{label:"a", html:"The tangent gradient is $1$, so $e^x=1$ and $x=0$. The tangent point is $(0,1)$."},{label:"b", html:"Substitute $(0,1)$ into $y=x+c$, giving $c=1$."},{label:"d", html:"The area from $0$ to $\\ln2$ is $\\int_0^{\\ln2}(x+1-e^x)\\,dx=\\left[\\frac{x^2}{2}+x-e^x\\right]_0^{\\ln2}=\\frac{(\\ln2)^2}{2}+\\ln2-1$."},{label:"e", html:"Since $g(x)=\\ln x$, a suitable integral is $\\int_1^2\\ln x\\,dx$ for the area under $g$ from $x=1$ to $x=2$."}],
    source: "2020 WACE"
  },
  {
    id: 48,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 12 — binomial model and confidence intervals",
    topics: "confidence probability normal",
    marks: "21 marks",
    body: `<p>It is estimated that $20\\%$ of small businesses fail in their first year. A sample of $500$ new businesses is observed. Later, a second sample of $500$ businesses receives regular financial advice.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)–(c)</div><div class="wace-part-text">Use binomial and normal approximation ideas to analyse the sample proportion.</div><div class="wace-part-marks">7 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)–(f)</div><div class="wace-part-text">Construct confidence intervals and compare the effect of financial advice.</div><div class="wace-part-marks">8 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(g)–(h)</div><div class="wace-part-text">Discuss the effect of sample size and binomial assumptions.</div><div class="wace-part-marks">6 marks</div></div></div>`,
    breakdown: ["Model counts with a binomial distribution where appropriate.", "Approximate sample proportions with a normal distribution when $np$ and $n(1-p)$ are large.", "For confidence intervals, use $\\hat p\\pm z\\sqrt{\\hat p(1-\\hat p)/n}$."],
    hints: ["For the first sample, $p=0.20$ and $n=500$.", "For the 2018 sample, $\\hat p=90/500=0.18$.", "For the financial advice sample, $\\hat p=80/500=0.16$."],
    solutions: [{label:"a", html:"The count of failures is $X\\sim B(500,0.20)$, so $P(X\\le120)$ can be found with technology and is approximately $0.987$."},{label:"b", html:"$\\hat p\\approx N\\left(0.20,\\frac{0.20(0.80)}{500}\\right)$ because $np=100$ and $n(1-p)=400$ are both large."},{label:"c", html:"$P(\\hat p\\lt0.18)=P\\left(Z\\lt\\frac{0.18-0.20}{\\sqrt{0.16/500}}\\right)\\approx P(Z\\lt-1.118)\\approx0.132$."},{label:"d", html:"For $90/500=0.18$, the 95% CI is $0.18\\pm1.96\\sqrt{0.18(0.82)/500}\\approx(0.146,0.214)$."},{label:"f", html:"For $80/500=0.16$, the 95% CI is $0.16\\pm1.96\\sqrt{0.16(0.84)/500}\\approx(0.128,0.192)$. Since this interval sits mostly below $0.20$, there is evidence the advice may reduce failures."},{label:"g", html:"Reducing sample size increases the standard error, so the confidence interval becomes wider."},{label:"h", html:"Assumptions include fixed number of businesses, independent outcomes, and approximately constant probability of failure. These may be questionable if businesses influence each other or vary greatly in risk."}],
    source: "2020 WACE"
  },
  {
    id: 49,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 13 — logarithmic cost model",
    topics: "logarithms differentiation",
    marks: "7 marks",
    body: `<p>A company can manufacture up to $200$ components in one day. The total cost, in hundreds of dollars, is modelled by $C(x)=\\dfrac{x\\ln(2x+1)}{3}-2x+120$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Find the total cost of manufacturing $20$ components.</div><div class="wace-part-marks">1 mark</div></div><div class="wace-q-part"><div class="wace-part-label">(b)–(c)</div><div class="wace-part-text">Sketch the cost graph and use it to decide how many components minimise the total cost.</div><div class="wace-part-marks">6 marks</div></div></div>`,
    breakdown: ["Substitute $x=20$ to evaluate cost.", "Use graphing technology or derivative analysis to locate the minimum on $0\\le x\\le200$.", "Interpret the result in whole components."],
    hints: ["The cost is measured in hundreds of dollars.", "The minimum occurs where $C'(x)=0$ or at an endpoint.", "A CAS/graph is appropriate in calculator-assumed work."],
    solutions: [{label:"a", html:"$C(20)=\\frac{20\\ln41}{3}-40+120\\approx104.76$, so the cost is about $\\$10\\,476$."},{label:"c", html:"Using a graph/CAS on $0\\le x\\le200$, the minimum occurs at approximately $x=7$ components. The answer should be interpreted as a whole number of components near this minimum."}],
    source: "2020 WACE"
  },
  {
    id: 50,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 14 — sample size, margin of error and sampling bias",
    topics: "confidence probability",
    marks: "10 marks",
    body: `<p>A consultant estimates the proportion of residents who use a library.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Find the minimum sample size for a 95% confidence interval with margin of error $0.01$, using the maximum possible margin of error.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">If $n=500$, find the maximum margin of error for a 99% confidence interval.</div><div class="wace-part-marks">3 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Identify two possible sources of bias if the sample is taken from passers-by outside the library at lunchtime.</div><div class="wace-part-marks">4 marks</div></div></div>`,
    breakdown: ["Use the worst-case value $\\hat p=0.5$ when no estimate is known.", "Use $E=z\\sqrt{\\hat p(1-\\hat p)/n}$.", "For bias, focus on who is excluded or over-represented."],
    hints: ["For 95%, use $z=1.96$.", "For 99%, use $z\\approx2.576$.", "Standing outside the library is likely to over-sample library users."],
    solutions: [{label:"a", html:"$0.01=1.96\\sqrt{0.25/n}$ gives $n=(1.96^2)(0.25)/(0.01^2)=9604$, so at least $9604$ residents."},{label:"b", html:"$E=2.576\\sqrt{0.25/500}\\approx0.0576$."},{label:"c", html:"Possible biases: sampling outside the library over-represents library users; sampling at lunchtime excludes residents who are at work/school or unavailable at that time; passers-by may not represent all suburb residents."}],
    source: "2020 WACE"
  },
  {
    id: 51,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 15 — exponential heating model",
    topics: "differentiation logarithms",
    marks: "9 marks",
    body: `<p>The temperature of water in an oven is modelled by $T(t)=T_0-175e^{-0.07t}$, where $t$ is measured in minutes.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)–(c)</div><div class="wace-part-text">Evaluate temperatures and decide how to adjust the oven setting so water reaches boiling after five minutes.</div><div class="wace-part-marks">4 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)–(e)</div><div class="wace-part-text">Find the rate of temperature increase at $t=5$ and explain the long-term behaviour of the rate.</div><div class="wace-part-marks">5 marks</div></div></div>`,
    breakdown: ["Substitute values into the model for temperature.", "Differentiate the model for the rate of heating.", "Analyse $e^{-0.07t}$ as $t$ increases."],
    hints: ["At $t=0$, $e^0=1$.", "To reach boiling in 5 minutes, solve $100=T_0-175e^{-0.35}$ for $T_0$.", "$T'(t)=12.25e^{-0.07t}$."],
    solutions: [{label:"a", html:"With $T_0=200$, $T(0)=200-175=25^\\circ\\text{C}$."},{label:"b", html:"$T(5)=200-175e^{-0.35}\\approx76.65^\\circ\\text{C}$."},{label:"c", html:"Set $100=T_0-175e^{-0.35}$, so $T_0\\approx223.35^\\circ\\text{C}$. The oven setting should be increased to about $223^\\circ$C."},{label:"d", html:"$T'(t)=12.25e^{-0.07t}$, so $T'(5)=12.25e^{-0.35}\\approx8.63^\\circ\\text{C/min}$."},{label:"e", html:"As $t$ increases, $e^{-0.07t}$ decreases to $0$, so the rate of temperature increase decreases to $0$ as the water temperature approaches the oven temperature."}],
    source: "2020 WACE"
  },
  {
    id: 52,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 16 — normal model and alternative PDF",
    topics: "normal crv probability",
    marks: "7 marks",
    body: `<p>A refrigerator temperature $T$ is modelled as normal with mean $0.8^\\circ$C and standard deviation $0.4^\\circ$C. Fahrenheit temperature is $T_F=\\dfrac95T+32$. An alternative PDF is $p(t)=\\dfrac34t^3-3t^2+3t$ for $0\\le t\\le2$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)–(c)</div><div class="wace-part-text">Transform the mean/SD, calculate $P(T\\gt1)$, and comment on normal model suitability using the histogram.</div><div class="wace-part-marks">5 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(d)</div><div class="wace-part-text">Using the alternative PDF, find $P(T\\gt1)$.</div><div class="wace-part-marks">2 marks</div></div></div>`,
    breakdown: ["Linear transformations shift and scale the mean and SD.", "Use the normal distribution for the first probability.", "Use integration for the alternative continuous model."],
    hints: ["For $aT+b$, the mean becomes $a\\mu+b$ and the SD becomes $|a|\\sigma$.", "$P(T\\gt1)=P(Z\\gt\\frac{1-0.8}{0.4})$.", "For the alternative model, integrate $p(t)$ from 1 to 2."],
    solutions: [{label:"a", html:"Mean in Fahrenheit: $\\frac95(0.8)+32=33.44$. SD: $\\frac95(0.4)=0.72$."},{label:"b", html:"$P(T\\gt1)=P(Z\\gt0.5)\\approx0.3085$."},{label:"c", html:"The normal model should be questioned if the histogram is skewed, bounded, or not bell-shaped. A normal model also allows impossible temperatures outside the realistic range, so the context matters."},{label:"d", html:"$P(T\\gt1)=\\int_1^2(\\frac34t^3-3t^2+3t)\\,dt=\\left[\\frac{3t^4}{16}-t^3+\\frac{3t^2}{2}\\right]_1^2=\\frac{11}{16}=0.6875$."}],
    source: "2020 WACE"
  },
  {
    id: 53,
    year: "2020",
    section: "Calculator-Assumed",
    title: "Question 17 — optimisation with a sinusoidal boundary",
    topics: "differentiation integration",
    marks: "12 marks",
    body: `<p>A sheep enclosure has fence lengths $EF=p$ and $FG=q$ with $p+q=500$. The road boundary is $R(x)=10\\sin\\left(\\dfrac{x}{15}\\right)+p$.</p><div class="wace-q-parts"><div class="wace-q-part"><div class="wace-part-label">(a)</div><div class="wace-part-text">Show that the area can be written as $A(q)=500q-150\\cos\\left(\\dfrac q{15}\\right)-q^2+150$.</div><div class="wace-part-marks">4 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(b)</div><div class="wace-part-text">Determine the $q$ value that maximises the grazing area and state the maximum area.</div><div class="wace-part-marks">4 marks</div></div><div class="wace-q-part"><div class="wace-part-label">(c)</div><div class="wace-part-text">Find $R'(x)$ and use the arc length integral to determine total fencing for the maximum-area enclosure.</div><div class="wace-part-marks">4 marks</div></div></div>`,
    breakdown: ["Use $p=500-q$.", "Area is found by integrating the vertical height from $0$ to $q$.", "Maximise $A(q)$ using calculus or technology, then use arc length for the curved boundary."],
    hints: ["$A(q)=\\int_0^q R(x)\\,dx$ after substituting $p=500-q$.", "$A'(q)=500+10\\sin(q/15)-2q$.", "$R'(x)=\\frac23\\cos(x/15)$."],
    solutions: [{label:"a", html:"With $p=500-q$, $A(q)=\\int_0^q\\left(10\\sin(x/15)+500-q\\right)dx$. This gives $[-150\\cos(x/15)+(500-q)x]_0^q=500q-q^2-150\\cos(q/15)+150$."},{label:"b", html:"$A'(q)=500-2q+10\\sin(q/15)$. Solving $A'(q)=0$ on the valid domain gives $q\\approx246.65$ m, so to the nearest metre $q=247$ m. Substituting gives maximum area about $62\\,750\\text{ m}^2$ (calculator value may vary slightly by rounding)."},{label:"c", html:"$R'(x)=\\frac{10}{15}\\cos(x/15)=\\frac23\\cos(x/15)$. The curved road fence length is $\\int_0^q\\sqrt{1+(\\frac23\\cos(x/15))^2}\\,dx$, evaluated at the maximising $q$. Add the straight fence lengths $p+q=500$ to get total fencing."}],
    source: "2020 WACE"
  }
];


// WACE BANK — 2024 and 2025 Exam Expansion
const WACE_2024_QUESTIONS = [{"id": 54, "year": "2024", "section": "Calculator-Free", "title": "Question 1 — logarithmic derivative and antiderivative", "topics": "differentiation integration logarithms", "marks": "6 marks", "body": "<p>Differentiate f(x)=x² ln(4x+3), then recover g(x) from g′(x)=3x/(3x²+1) and g(1)=ln(6).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Differentiate the logarithmic product.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Integrate the reciprocal-linear derivative and use the initial condition.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For part (a), treat $x^2\\ln(4x+3)$ as a product: $u=x^2$ and $v=\\ln(4x+3)$.", "The derivative of the log factor is $\\dfrac{4}{4x+3}$, so the product rule has two terms: $u'v+uv'$.", "For part (b), rewrite $\\dfrac{3x}{3x^2+1}$ as $\\dfrac12\\cdot\\dfrac{6x}{3x^2+1}$, then use $g(1)=\\ln6$ to find the constant."], "solutions": [{"label": "a", "html": "Use the product rule with $u=x^2$ and $v=\\ln(4x+3)$. Then $u'=2x$ and $v'=\\dfrac{4}{4x+3}$, so<br>$f'(x)=2x\\ln(4x+3)+\\dfrac{4x^2}{4x+3}$."}, {"label": "b", "html": "$g'(x)=\\dfrac{3x}{3x^2+1}=\\dfrac12\\cdot\\dfrac{6x}{3x^2+1}$, so<br>$g(x)=\\dfrac12\\ln(3x^2+1)+c$."}, {"label": "b", "html": "Use $g(1)=\\ln6$: $\\dfrac12\\ln4+c=\\ln6$. Since $\\dfrac12\\ln4=\\ln2$, $c=\\ln6-\\ln2=\\ln3$. Therefore<br><strong>$g(x)=\\dfrac12\\ln(3x^2+1)+\\ln3$</strong>."}], "source": "2024 WACE"}, {"id": 55, "year": "2024", "section": "Calculator-Free", "title": "Question 2 — kinematics, velocity and total distance", "topics": "kinematics differentiation integration", "marks": "10 marks", "body": "<p>The position x(t)=⅓t³−7t²+40t models an advertising graphic over 15 seconds.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine initial velocity.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Decide whether it is initially speeding up or slowing down.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Evaluate a signed displacement integral.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Find total distance by splitting at changes of direction.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Differentiate the position: $v(t)=t^2-14t+40$, then differentiate again for $a(t)=2t-14$.", "For initial speeding/slowing, compare the signs of $v(0)$ and $a(0)$; same signs mean speeding up, opposite signs mean slowing down.", "For total distance, solve $v(t)=0$ to find the direction changes, split at $t=4$ and $t=10$, then add absolute changes in position."], "solutions": [{"label": "a", "html": "$x(t)=\\dfrac13t^3-7t^2+40t$, so $v(t)=x'(t)=t^2-14t+40$. Hence $v(0)=40$. <strong>Initial velocity: $40$ cm/s.</strong>"}, {"label": "b", "html": "$a(t)=v'(t)=2t-14$, so $a(0)=-14$ cm/s$^2$. Since $v(0)>0$ and $a(0)<0$, velocity and acceleration have opposite signs, so the graphic is <strong>slowing down initially</strong>."}, {"label": "c", "html": "$\\displaystyle\\int_3^9v(t)\\,dt=x(9)-x(3)$. From the table or the position function, $x(9)=36$ and $x(3)=66$, so the signed displacement is <strong>$-30$ cm</strong>."}, {"label": "d", "html": "Find direction changes from $v(t)=0$: $t^2-14t+40=(t-4)(t-10)=0$, so split at $t=4$ and $t=10$."}, {"label": "d", "html": "$x(0)=0$, $x(4)=\\dfrac{208}{3}$, $x(10)=\\dfrac{100}{3}$, and $x(15)=150$. Total distance is<br>$\\left|\\dfrac{208}{3}-0\\right|+\\left|\\dfrac{100}{3}-\\dfrac{208}{3}\\right|+\\left|150-\\dfrac{100}{3}\\right|=222$.<br><strong>Total distance: $222$ cm.</strong>"}], "source": "2024 WACE"}, {"id": 56, "year": "2024", "section": "Calculator-Free", "title": "Question 3 — discrete distribution and conditional probability", "topics": "drv probability", "marks": "6 marks", "body": "<p>A discrete random variable has partially completed probability and cumulative probability tables.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Complete the missing entries.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Evaluate P(2 ≤ X ≤ 4).</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Evaluate P(X = 1 | X ≤ 3).</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Use the jumps in the cumulative table: $P(X=x)=F(x)-F(\\text{previous value})$.", "For $P(2\\le X\\le4)$, add the individual probabilities for $X=2$, $X=3$ and $X=4$.", "For $P(X=1\\mid X\\le3)$, the numerator is $P(X=1)$ and the denominator is $P(X\\le3)$."], "solutions": [{"label": "a", "html": "Use the cumulative totals. The completed probability row is<br>$\\begin{array}{c|ccccc}x&1&2&3&4&5\\\\hline P(X=x)&0.20&0.15&0.25&0.35&0.05\\end{array}$"}, {"label": "a", "html": "The completed cumulative row is<br>$\\begin{array}{c|ccccc}x&1&2&3&4&5\\\\hline P(X\\leq x)&0.20&0.35&0.60&0.95&1.00\\end{array}$"}, {"label": "b", "html": "$P(2\\leq X\\leq4)=P(X=2)+P(X=3)+P(X=4)=0.15+0.25+0.35=\\mathbf{0.75}$."}, {"label": "c", "html": "$P(X=1\\mid X\\leq3)=\\dfrac{P(X=1)}{P(X\\leq3)}=\\dfrac{0.20}{0.60}=\\mathbf{\\dfrac13}$."}], "source": "2024 WACE"}, {"id": 57, "year": "2024", "section": "Calculator-Free", "title": "Question 4 — uniform CRV and binomial reverse problem", "topics": "crv drv probability", "marks": "6 marks", "body": "<p>A uniform continuous variable has mean 6 and maximum 9; a binomial variable has given mean and variance.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine the variance of the uniform variable.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Use binomial mean and variance to find P(W = 1).</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For the uniform variable, use $E(X)=\\dfrac{a+b}{2}$. You know the mean is $6$ and the maximum is $9$, so work backwards to the minimum endpoint.", "For the binomial variable, write $np=\\dfrac12$ and $np(1-p)=\\dfrac{5}{12}$. Dividing the equations isolates $1-p$.", "Once $n$ and $p$ are known, use $P(W=1)=\\binom n1p(1-p)^{n-1}$."], "solutions": [{"label": "a", "html": "For a continuous uniform distribution on $[a,9]$, $E(X)=\\dfrac{a+9}{2}=6$, so $a=3$."}, {"label": "a", "html": "Therefore $X\\sim U(3,9)$ and $\\operatorname{Var}(X)=\\dfrac{(9-3)^2}{12}=\\mathbf{3}$."}, {"label": "b", "html": "For $W\\sim B(n,p)$, $np=\\dfrac12$ and $np(1-p)=\\dfrac{5}{12}$. Dividing gives $1-p=\\dfrac{5/12}{1/2}=\\dfrac56$, so $p=\\dfrac16$."}, {"label": "b", "html": "Then $n\\cdot\\dfrac16=\\dfrac12$, so $n=3$. Hence<br>$P(W=1)=\\binom31\\left(\\dfrac16\\right)\\left(\\dfrac56\\right)^2=\\mathbf{\\dfrac{25}{72}}$."}], "source": "2024 WACE"}, {"id": 58, "year": "2024", "section": "Calculator-Free", "title": "Question 5 — logarithmic graph transformations", "topics": "logarithms", "marks": "8 marks", "body": "<p>A graph of f(x)=log_a(x) is labelled using a constant p, then transformed graphs are shown.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Express log_a(0.5) in terms of p.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Evaluate a^(5p).</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Solve log_a(x−3)=3p.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Determine equations of transformed logarithmic graphs.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Use the graph values as log facts: for example, the curve shows inputs such as $2,4,8$ matching heights $p,2p,3p$.", "For $\\log_a(0.5)$, rewrite $0.5$ as $2^{-1}$ and use the power law for logarithms.", "For the transformed graphs, compare each curve's asymptote and vertical position with the original $f(x)=\\log_a x$."], "solutions": [{"label": "a", "html": "From the graph, $p=\\log_a2$. Since $0.5=2^{-1}$,<br>$\\log_a(0.5)=\\log_a(2^{-1})=-\\log_a2=\\mathbf{-p}$."}, {"label": "b", "html": "Because $a^p=2$, $a^{5p}=(a^p)^5=2^5=\\mathbf{32}$."}, {"label": "c", "html": "$3p=3\\log_a2=\\log_a(2^3)=\\log_a8$. Thus $\\log_a(x-3)=\\log_a8$, so $x-3=8$ and <strong>$x=11$</strong>."}, {"label": "d", "html": "Curve A passes through the same key points as $\\log_a(2x)$, so <strong>$A:y=\\log_a(2x)$</strong>. Curve B is the graph shifted left by 1, so <strong>$B:y=\\log_a(x+1)$</strong>."}], "source": "2024 WACE"}, {"id": 59, "year": "2024", "section": "Calculator-Free", "title": "Question 6 — integral bounds from rectangles", "topics": "integration", "marks": "5 marks", "body": "<p>Use rectangles to bound the area under y=x sin(πx) from x=1/6 to x=1/2.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Shade the integral region.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Demonstrate lower and upper bounds and suggest an improvement.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["The shaded integral is the area under $y=x\\sin(\\pi x)$ from $x=\\frac16$ to $x=\\frac12$.", "Use rectangle widths of $\\frac16$ and exact heights at $x=\\frac16$, $x=\\frac13$ and $x=\\frac12$.", "Choose lower and upper rectangles by checking whether the function is increasing or decreasing on each small interval; more thinner rectangles improve the estimate."], "solutions": [{"label": "a", "html": "Shade the region under $y=x\\sin(\\pi x)$ from $x=\\dfrac16$ to $x=\\dfrac12$. This represents $\\displaystyle\\int_{1/6}^{1/2}x\\sin(\\pi x)\\,dx$."}, {"label": "b.i", "html": "Use subintervals $[\\frac16,\\frac13]$ and $[\\frac13,\\frac12]$, each of width $\\frac16$. The function is increasing on this interval, so left-endpoint rectangles give the lower bound."}, {"label": "b.i", "html": "$f(\\frac16)=\\frac16\\cdot\\frac12=\\frac1{12}$ and $f(\\frac13)=\\frac13\\cdot\\frac{\\sqrt3}{2}=\\frac{\\sqrt3}{6}$. Lower bound:<br>$\\dfrac16\\left(\\dfrac1{12}+\\dfrac{\\sqrt3}{6}\\right)=\\mathbf{\\dfrac{1+2\\sqrt3}{72}}$."}, {"label": "b.i", "html": "Right-endpoint rectangles give the upper bound. $f(\\frac13)=\\frac{\\sqrt3}{6}$ and $f(\\frac12)=\\frac12$. Upper bound:<br>$\\dfrac16\\left(\\dfrac{\\sqrt3}{6}+\\dfrac12\\right)=\\mathbf{\\dfrac{3+\\sqrt3}{36}}$."}, {"label": "b.ii", "html": "The approximation could be improved by using more, thinner rectangles or a smaller subinterval width."}], "source": "2024 WACE"}, {"id": 60, "year": "2024", "section": "Calculator-Free", "title": "Question 7 — increments formula for a trigonometric speed model", "topics": "differentiation", "marks": "10 marks", "body": "<p>A bicycle speed model involving sin(θ) and cos(θ) is differentiated and used with increments.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Evaluate speed at 45°.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Differentiate the inner expression.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Show the stated derivative of speed.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Estimate the change from 45° to 46°.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Convert angles first: $45^\\circ=\\frac\\pi4$, and a $1^\\circ$ change is $\\frac\\pi{180}$ radians.", "Differentiate the speed formula with respect to $\\theta$ carefully; the question's 'hence' means the derivative from part (b) should be reused.", "For the increments estimate, use $\\delta s\\approx s'(\\pi/4)\\,\\delta\\theta$ with $\\delta\\theta=\\frac\\pi{180}$."], "solutions": [{"label": "a", "html": "At $\\theta=45^\\circ=\\dfrac\\pi4$, $\\sin\\theta=\\cos\\theta$, so<br>$s=\\sqrt{\\dfrac{101\\sin\\theta-\\cos\\theta}{\\sin\\theta}}=\\sqrt{101-1}=\\mathbf{10}$ m/s."}, {"label": "b", "html": "First simplify the expression inside the square root:<br>$\\dfrac{101\\sin\\theta-\\cos\\theta}{\\sin\\theta}=101-\\cot\\theta$. Therefore<br>$\\dfrac{d}{d\\theta}(101-\\cot\\theta)=\\csc^2\\theta=\\mathbf{\\dfrac1{\\sin^2\\theta}}$."}, {"label": "c", "html": "Since $s(\\theta)=\\sqrt{101-\\cot\\theta}$,<br>$\\dfrac{ds}{d\\theta}=\\dfrac{1}{2\\sqrt{101-\\cot\\theta}}\\cdot\\dfrac1{\\sin^2\\theta}=\\mathbf{\\dfrac{1}{2\\sin^2\\theta\\sqrt{\\dfrac{101\\sin\\theta-\\cos\\theta}{\\sin\\theta}}}}$."}, {"label": "d", "html": "For $45^\\circ$ to $46^\\circ$, $\\delta\\theta=1^\\circ=\\dfrac\\pi{180}$ radians. At $\\theta=\\dfrac\\pi4$, $\\dfrac{ds}{d\\theta}=\\dfrac1{10}$."}, {"label": "d", "html": "Using increments, $\\delta s\\approx\\dfrac1{10}\\cdot\\dfrac\\pi{180}=\\mathbf{\\dfrac\\pi{1800}\\approx0.00175}$ m/s. The speed increases by about $0.00175$ m/s."}], "source": "2024 WACE"}, {"id": 61, "year": "2024", "section": "Calculator-Assumed", "title": "Question 8 — exponential medication model and increments", "topics": "differentiation logarithms", "marks": "11 marks", "body": "<p>Medication remaining in the body is modelled by exponential decay, with a repeated-dose function B(T).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(c)</div><div class=\"wace-part-text\">Evaluate amount, half-life and rate of decrease.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)–(e)</div><div class=\"wace-part-text\">Solve for a dosing interval and approximate the effect of a 30-minute increase.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For $A(t)$, substitute $t=10$ directly. For the half-life, set $5e^{-0.0173t}=2.5$ before taking natural logs.", "For the rate of decrease, differentiate: $A'(t)=-0.0865e^{-0.0173t}$, then evaluate at $t=24$.", "For the dosing interval, solve $\\dfrac5{1-e^{-0.0173T}}=8.85$; for the increments part use $\\delta T=0.5$ hours."], "solutions": [{"label": "a", "html": "$A(10)=5e^{-0.0173(10)}=5e^{-0.173}\\approx\\mathbf{4.21}$ mg."}, {"label": "b", "html": "Half the original amount is $2.5$ mg. Solve $5e^{-0.0173t}=2.5$: $e^{-0.0173t}=0.5$, so<br>$t=\\dfrac{\\ln2}{0.0173}\\approx\\mathbf{40.1}$ hours."}, {"label": "c", "html": "$A'(t)=5(-0.0173)e^{-0.0173t}=-0.0865e^{-0.0173t}$. At $t=24$, $A'(24)\\approx-0.0571$ mg/h, so the medication is decreasing at <strong>$0.0571$ mg/h</strong>."}, {"label": "d", "html": "Solve $\\dfrac{5}{1-e^{-0.0173T}}=8.85$. Then $e^{-0.0173T}=1-\\dfrac{5}{8.85}$, giving<br>$T\\approx\\mathbf{48.1}$ hours."}, {"label": "e", "html": "$B'(T)=-\\dfrac{5(0.0173)e^{-0.0173T}}{(1-e^{-0.0173T})^2}$. At $T\\approx48.1$, $B'(T)\\approx-0.1179$ mg/h."}, {"label": "e", "html": "A 30-minute increase is $\\delta T=0.5$ hours. Thus $\\delta B\\approx B'(T)\\delta T\\approx-0.1179(0.5)=\\mathbf{-0.0589}$ mg. The amount immediately after a tablet decreases by about $0.059$ mg."}], "source": "2024 WACE"}, {"id": 62, "year": "2024", "section": "Calculator-Assumed", "title": "Question 9 — confidence intervals as random variables", "topics": "confidence drv probability", "marks": "8 marks", "body": "<p>A teacher flips a fair coin and students calculate 90% confidence intervals.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Calculate a 90% CI for heads from 30 out of 50.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)–(d)</div><div class=\"wace-part-text\">Model the number of intervals containing the true proportion and calculate summary values/probability.</div><div class=\"wace-part-marks\">6 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For the teacher's interval, use $\\hat p=\\frac{30}{50}$ and the 90% critical value $z\\approx1.645$.", "A student's interval containing the true proportion is a success with probability $0.90$, so model $X$ with $n=20$ and $p=0.90$.", "'Three students do not contain the true proportion' means exactly three failures, so use failure probability $0.10$."], "solutions": [{"label": "a", "html": "$\\hat p=\\dfrac{30}{50}=0.60$. A 90% CI is<br>$0.60\\pm1.645\\sqrt{\\dfrac{0.60(0.40)}{50}}=0.60\\pm0.114$."}, {"label": "a", "html": "So the 90% confidence interval is approximately <strong>$(0.486,\\,0.714)$</strong>."}, {"label": "b", "html": "Each student's 90% confidence interval contains the true proportion with probability $0.90$, so $X\\sim B(20,0.90)$."}, {"label": "c", "html": "$E(X)=np=20(0.90)=\\mathbf{18}$ and $\\operatorname{Var}(X)=np(1-p)=20(0.90)(0.10)=\\mathbf{1.8}$."}, {"label": "d", "html": "If three students' intervals do not contain the true proportion, then 17 do contain it. Thus<br>$P=\\binom{20}{3}(0.10)^3(0.90)^{17}\\approx\\mathbf{0.190}$."}], "source": "2024 WACE"}, {"id": 63, "year": "2024", "section": "Calculator-Assumed", "title": "Question 10 — sampling bias and confidence intervals", "topics": "confidence probability normal", "marks": "13 marks", "body": "<p>A publisher’s printing-error claim is investigated using sampling and confidence intervals.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Identify bias and improve the sampling method.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Use approximate normality for a sample proportion.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(f)</div><div class=\"wace-part-text\">Form, interpret and improve a 95% confidence interval; find required sample size.</div><div class=\"wace-part-marks\">7 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For bias, focus on 'first 200 books', the 6-hour window, and using only the newest press; these may not represent the whole print run.", "For the sample-proportion probability, use the publisher's claimed rate $p=0.05$ with $n=200$ in the normal approximation for $\\hat p$.", "For the guaranteed sample size, use the margin formula with worst-case $\\hat p(1-\\hat p)=0.25$, then round the result up."], "solutions": [{"label": "a.i", "html": "One source of bias is choosing the first 200 books from only a 6-hour window and only the newest printing press. This may not represent all presses or all times in the week."}, {"label": "a.ii", "html": "Reduce bias by randomly sampling books from across the whole print run, across all four printing presses and across different times/days of the week."}, {"label": "b", "html": "The claimed error proportion is $p=\\dfrac{10}{200}=0.05$. For $n=200$, $\\hat p\\approx N\\left(0.05,\\dfrac{0.05(0.95)}{200}\\right)$."}, {"label": "b", "html": "$z=\\dfrac{0.04-0.05}{\\sqrt{0.05(0.95)/200}}\\approx-0.649$, so $P(\\hat p\\lt0.04)\\approx\\mathbf{0.258}$."}, {"label": "c", "html": "The 95% confidence interval is $0.10\\pm0.024$, so <strong>$(0.076,\\,0.124)$</strong>."}, {"label": "d", "html": "The claimed proportion $0.05$ is not in $(0.076,0.124)$, so the data suggest the true proportion of books with errors is different from, and higher than, the publisher's claim."}, {"label": "e", "html": "The margin of error could be decreased by increasing the sample size and/or using a lower confidence level. Better sampling does not directly change the formula, but it improves reliability of the estimate."}, {"label": "f", "html": "To guarantee a 95% margin at most $0.02$, use the conservative value $p(1-p)\\leq0.25$:<br>$n\\geq\\dfrac{1.96^2(0.25)}{0.02^2}=2401$. <strong>Minimum sample size: $2401$.</strong>"}], "source": "2024 WACE"}, {"id": 64, "year": "2024", "section": "Calculator-Assumed", "title": "Question 11 — reverse confidence interval and comparing widths", "topics": "confidence", "marks": "10 marks", "body": "<p>A 95% CI has known centre and width, and three cities have different sample sizes/proportions.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Recover the interval and sample size.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Interpret a 74% claim.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Compare confidence-interval widths between cities.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["The interval width $0.096$ is twice the margin of error, so start with $E=0.048$ centred on $\\hat p=0.70$.", "To find the sample size, solve $0.048=1.96\\sqrt{\\dfrac{0.7(0.3)}{n}}$.", "For comparing widths, larger sample size narrows the interval; if sample sizes are equal, compare $\\hat p(1-\\hat p)$."], "solutions": [{"label": "a.i", "html": "The interval is centred at $\\hat p=0.70$ and has width $0.096$, so the margin is $0.048$. Hence the 95% CI is <strong>$(0.652,\\,0.748)$</strong>."}, {"label": "a.ii", "html": "Use $0.048=1.96\\sqrt{\\dfrac{0.70(0.30)}{n}}$. Solving gives $n\\approx350.15$, so the sample size is approximately <strong>$350$ people</strong>."}, {"label": "b", "html": "The protest group's claim is $p=0.74$. Since $0.74$ lies inside $(0.652,0.748)$, the confidence interval does not give strong evidence against the claim."}, {"label": "c.i", "html": "Brisbane and Sydney have the same sample proportion, but Sydney has sample size $2N$. Larger sample size gives a smaller margin of error, so <strong>Brisbane</strong> has the wider interval."}, {"label": "c.ii", "html": "Brisbane and Hobart have the same sample size. Compare $\\hat p(1-\\hat p)$: Brisbane $0.65(0.35)=0.2275$, Hobart $0.75(0.25)=0.1875$. Brisbane has the larger value, so <strong>Brisbane</strong> has the wider interval."}], "source": "2024 WACE"}, {"id": 65, "year": "2024", "section": "Calculator-Assumed", "title": "Question 12 — optimisation of a sideboard cross-section", "topics": "differentiation", "marks": "9 marks", "body": "<p>A circular log is cut into a square beam and sideboards, leading to A(x)=2x√(400−40x−x²).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find the exact log radius.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Show the area formula.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Maximise the sideboard area using calculus.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["The square beam has side $40$ cm, so the circle's diameter is the beam's diagonal $40\\sqrt2$.", "For the sideboard area, use the circle geometry to express the sideboard width $y$ in terms of $x$, then use $A=2xy$.", "To maximise $A(x)=2x\\sqrt{400-40x-x^2}$, differentiate with product and chain rules, set $A\'(x)=0$, then recover $y$."], "solutions": [{"label": "a", "html": "The square beam has side length $40$ cm, so its diagonal is $40\\sqrt2$ cm. This is the diameter of the circular log, so the radius is <strong>$20\\sqrt2$ cm</strong>."}, {"label": "b", "html": "At height $x$ above the beam, use the circle radius to obtain the sideboard half-width $\\sqrt{400-40x-x^2}$. Since the sideboard has height $2x$, its area is<br>$A(x)=2x\\sqrt{400-40x-x^2}$, as required."}, {"label": "c", "html": "Differentiate $A(x)=2x(400-40x-x^2)^{1/2}$. This gives<br>$A\'(x)=\\dfrac{800-120x-4x^2}{\\sqrt{400-40x-x^2}}$."}, {"label": "c", "html": "Set the numerator to zero: $800-120x-4x^2=0$, or $x^2+30x-200=0$. Hence<br>$x=-15+5\\sqrt{17}\\approx\\mathbf{5.62}$ cm."}, {"label": "c", "html": "Then $y=2\\sqrt{400-40x-x^2}\\approx\\mathbf{23.99}$ cm. So the maximum-area sideboard has dimensions approximately <strong>$5.62$ cm by $23.99$ cm</strong>."}], "source": "2024 WACE"}, {"id": 66, "year": "2024", "section": "Calculator-Assumed", "title": "Question 13 — normal distribution and histogram comparison", "topics": "normal probability", "marks": "12 marks", "body": "<p>Electric vehicle ranges are modelled using a normal distribution and compared with grouped histogram data.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(c)</div><div class=\"wace-part-text\">Find standard deviation, a tail probability and transformed mean/variance.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)–(f)</div><div class=\"wace-part-text\">Assess a histogram model, estimate a mean and compare two vehicles.</div><div class=\"wace-part-marks\">6 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Use $P(X>400)=0.2525$ to form the standardised equation $z=\\dfrac{400-350}{\\sigma}$.", "For miles, $Y=X/1.6$, so the mean is divided by $1.6$ and the variance is divided by $1.6^2$.", "For Spruky, estimate the mean from the histogram using class midpoints multiplied by frequencies, then divide by 200."], "solutions": [{"label": "a", "html": "For Zaprer, $X\\sim N(350,\\sigma^2)$ and $P(X>400)=0.2525$. Thus $P\\left(Z\\leq\\dfrac{400-350}{\\sigma}\\right)=0.7475$, giving $z\\approx0.67$ and $\\sigma\\approx\\dfrac{50}{0.67}\\approx\\mathbf{75}$ km."}, {"label": "b", "html": "$P(X>420)=P\\left(Z>\\dfrac{420-350}{75}\\right)=P(Z>0.933)\\approx\\mathbf{0.175}$."}, {"label": "c", "html": "Since $Y=\\dfrac{X}{1.6}$, $E(Y)=\\dfrac{350}{1.6}=\\mathbf{218.75}$ miles and $\\operatorname{Var}(Y)=\\dfrac{75^2}{1.6^2}\\approx\\mathbf{2197}$ miles$^2$."}, {"label": "d", "html": "The histogram is not very symmetric and is skewed to the left, so a normal distribution is not an appropriate model for Spruky range."}, {"label": "e", "html": "Using class midpoints $270,290,\\dots,430$ and the histogram frequencies, the estimated mean is<br>$\\dfrac{\\sum fx}{200}\\approx\\mathbf{376}$ km."}, {"label": "f", "html": "For Spruky, the histogram estimate gives $P(W>420)\\approx\\dfrac{20}{200}=0.10$. Zaprer gave about $0.175$, so Brianna is more likely to reach Albany without recharging in a <strong>Zaprer</strong> vehicle."}], "source": "2024 WACE"}, {"id": 67, "year": "2024", "section": "Calculator-Assumed", "title": "Question 14 — simulated distribution and expected profit", "topics": "drv probability", "marks": "14 marks", "body": "<p>A dice game produces a simulated distribution for rolls needed to win and a profit variable for the player.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Estimate probabilities from a frequency graph.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Explain why binomial modelling is unsuitable.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(e)</div><div class=\"wace-part-text\">Create the profit distribution, calculate mean/variance and decide profitability.</div><div class=\"wace-part-marks\">9 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Estimate probabilities from the bar chart by dividing each frequency by 500, e.g. exactly two rolls uses the bar at $x=2$.", "The player's profit values are $+1$, $0$ and $-1$ after accounting for the $1 game cost and the payout rules.", "Calculate $E(Y)=\\sum yP(Y=y)$ for player profit; the charity's long-run profit is the opposite sign."], "solutions": [{"label": "a.i", "html": "From the frequency graph, $P(X=2)\\approx\\dfrac{113}{500}=\\mathbf{0.226}$."}, {"label": "a.ii", "html": "Winning in two or fewer rolls has frequency $66+113=179$. Therefore not winning in two or fewer rolls is<br>$1-\\dfrac{179}{500}=\\dfrac{321}{500}=\\mathbf{0.642}$."}, {"label": "b", "html": "A binomial model is not suitable because the number of rolls is not fixed and the chance of success changes as winning dice are removed. The trials are not identical Bernoulli trials."}, {"label": "c", "html": "Net profit for the player is $Y=1$ if $X=1$ or $2$, $Y=0$ if $X=3$, and $Y=-1$ if $X\\geq4$."}, {"label": "c", "html": "Using the simulated distribution: $P(Y=1)=0.134+0.215=0.349$, $P(Y=0)=0.208$, and $P(Y=-1)=1-0.349-0.208=0.443$."}, {"label": "d.i", "html": "$E(Y)=1(0.349)+0(0.208)+(-1)(0.443)=\\mathbf{-0.094}$."}, {"label": "d.ii", "html": "$E(Y^2)=0.349+0.443=0.792$, so $\\operatorname{Var}(Y)=0.792-(-0.094)^2\\approx\\mathbf{0.783}$."}, {"label": "e", "html": "Since the player has expected profit $-0.094$, the charity has expected profit about $0.094$ dollars per game. In the long run, the game is expected to be profitable for the charity."}], "source": "2024 WACE"}, {"id": 68, "year": "2024", "section": "Calculator-Assumed", "title": "Question 15 — logarithmic earthquake magnitude model", "topics": "logarithms", "marks": "9 marks", "body": "<p>Moment magnitude is modelled as a linear function of log10(seismic moment).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Use the graph to estimate a magnitude.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)–(c)</div><div class=\"wace-part-text\">Find the logarithmic model parameters and rewrite the relationship.</div><div class=\"wace-part-marks\">5 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Find seismic moment for a given magnitude.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For $3.16\\times10^{13}$, use $\\log_{10}(3.16\\times10^{13})\\approx13.5$ as the horizontal graph value.", "Find the line equation for $M_w$ against $\\log_{10}(M_0)$ by reading two clear points from the graph to get slope and intercept.", "For $M_w=4$, solve the linear equation for $\\log_{10}(M_0)$ first, then convert back using $M_0=10^{\\text{that value}}$."], "solutions": [{"label": "a", "html": "For $M_0=3.16\\times10^{13}$, $\\log_{10}(M_0)\\approx13.5$. Reading the graph at $13.5$ gives <strong>$M_w\\approx3$</strong>."}, {"label": "b", "html": "The line passes through approximately $(0,-6)$ and $(18,6)$, so $a=\\dfrac{6-(-6)}{18-0}=\\dfrac23$ and $b=-6$. Thus $M_w=\\dfrac23\\log_{10}(M_0)-6$."}, {"label": "c", "html": "$M_w=\\dfrac23\\log_{10}(M_0)-6=\\dfrac23\\big(\\log_{10}(M_0)-9\\big)=\\dfrac23\\log_{10}\\left(\\dfrac{M_0}{10^9}\\right)$."}, {"label": "d", "html": "For $M_w=4$: $4=\\dfrac23\\log_{10}(M_0)-6$, so $10=\\dfrac23\\log_{10}(M_0)$ and $\\log_{10}(M_0)=15$. Hence <strong>$M_0=10^{15}$ Nm</strong>."}], "source": "2024 WACE"}, {"id": 69, "year": "2024", "section": "Calculator-Assumed", "title": "Question 16 — volume by integration in a parabolic bottle", "topics": "integration", "marks": "8 marks", "body": "<p>A shampoo bottle with parabolic cross-section is partially filled, then turned upside down.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Calculate volume using integration.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Set up and solve for the new shampoo level.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["At upright height $10$, solve $10=20-\\frac45x^2$ to get the half-width of the shampoo region.", "Volume is $4\\times$ cross-sectional area, so integrate the horizontal width with respect to height, then multiply by 4.", "After turning the bottle over, use the parabola $y=\\frac45x^2$, set the new volume equal to part (a), and solve for the level $h$."], "solutions": [{"label": "a", "html": "At fill height $10$ cm, the cross-sectional area of shampoo is<br>$\\displaystyle\\int_0^{10}2\\sqrt{25-\\dfrac54y}\\,dy=\\dfrac{400-100\\sqrt2}{3}$ cm$^2$."}, {"label": "a", "html": "The bottle width is $4$ cm, so<br>$V=4\\cdot\\dfrac{400-100\\sqrt2}{3}=\\mathbf{\\dfrac{1600-400\\sqrt2}{3}\\approx344.8}$ cm$^3$."}, {"label": "b", "html": "After turning the bottle upside down, the cross-section is $y=\\dfrac45x^2$. The shampoo area up to height $h$ is<br>$\\displaystyle\\int_0^h2\\sqrt{\\dfrac54y}\\,dy=\\dfrac{2\\sqrt5}{3}h^{3/2}$."}, {"label": "b", "html": "Set this equal to the original cross-sectional area: $\\dfrac{2\\sqrt5}{3}h^{3/2}=\\dfrac{400-100\\sqrt2}{3}$. Solving gives <strong>$h\\approx14.95$ cm</strong>."}], "source": "2024 WACE"}, {"id": 70, "year": "2024", "section": "Calculator-Assumed", "title": "Question 17 — logarithmic learning model", "topics": "logarithms", "marks": "6 marks", "body": "<p>The number of algorithms learnt is modelled by A(t)=b log_4(t+1)+c.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Determine b and c.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Predict the number learnt after 26 weeks.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Judge whether the full set is learnt within a lifetime.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Use $A(0)=21$ first: since $\\log_4(1)=0$, this gives the vertical parameter $c$ immediately.", "After one week, the total learnt is $21+32=53$, so substitute $t=1$ to determine $b$.", "To test whether all 493 algorithms are learnt, set $A(t)=493$ and solve the logarithmic equation for $t$."], "solutions": [{"label": "a", "html": "At $t=0$, $A(0)=b\\log_4(1)+c=c=21$, so $c=21$."}, {"label": "a", "html": "By the end of the first week, the cuber knows $21+32=53$ algorithms. Since $\\log_4(2)=\\dfrac12$, $53=\\dfrac b2+21$, so $b=64$."}, {"label": "b", "html": "$A(26)=64\\log_4(27)+21\\approx\\mathbf{173}$ algorithms."}, {"label": "c", "html": "To learn all $493$ algorithms, solve $64\\log_4(t+1)+21=493$. This gives $t+1=4^{472/64}$, so $t\\approx27553$ weeks, or about $530$ years. <strong>No, the model does not predict completion within a normal lifetime.</strong>"}], "source": "2024 WACE"}];

const WACE_2025_QUESTIONS = [{"id": 71, "year": "2025", "section": "Calculator-Free", "title": "Question 1 — CRV mean and median with logarithms", "topics": "crv integration logarithms", "marks": "6 marks", "body": "<p>A continuous random variable has a logarithmic probability density function on 1 ≤ x ≤ 5.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Calculate the exact mean.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find the exact median equation/value.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For the mean, set up $E(X)=\\int_1^5 x\\,p(x)\\,dx$; it is not simply the midpoint.", "The integral involving $x\\ln x$ needs integration by parts: take $u=\\ln x$ and $dv=x\\,dx$.", "For the median, solve $\\int_1^M p(x)\\,dx=0.5$ using $\\int\\ln x\\,dx=x\\ln x-x$."], "solutions": [{"label": "a", "html": "$p(x)=\\dfrac{1}{x\\ln5}$ for $1\\leq x\\leq5$. Therefore<br>$E(X)=\\displaystyle\\int_1^5x\\cdot\\dfrac{1}{x\\ln5}\\,dx=\\dfrac1{\\ln5}\\int_1^5 1\\,dx=\\mathbf{\\dfrac4{\\ln5}}$."}, {"label": "b", "html": "The median $M$ satisfies $P(X\\leq M)=0.5$. So<br>$\\displaystyle\\int_1^M\\dfrac{1}{x\\ln5}\\,dx=\\dfrac{\\ln M}{\\ln5}=0.5$."}, {"label": "b", "html": "Thus $\\ln M=\\dfrac12\\ln5=\\ln\\sqrt5$, so <strong>$M=\\sqrt5$</strong>."}], "source": "2025 WACE"}, {"id": 72, "year": "2025", "section": "Calculator-Free", "title": "Question 2 — signed area and the FTC", "topics": "integration", "marks": "5 marks", "body": "<p>F(x)=∫₀ˣ √t sin(t) dt is analysed using the graph of √x sin(x).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find F′(x).</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Determine the sign of F(0) and F(2π).</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["By the Fundamental Theorem of Calculus, $F\'(x)=\\sqrt{x}\\sin x$.", "$F(0)=0$ because the integral has the same upper and lower limit when $x=0$.", "For $F(2\\pi)$, use the signed areas from the graph: area above the axis is positive and area below the axis is negative."], "solutions": [{"label": "a", "html": "By the Fundamental Theorem of Calculus,<br>$F\'(x)=\\sqrt{x}\\sin x$."}, {"label": "b.i", "html": "$F(0)=\\displaystyle\\int_0^0\\sqrt t\\sin t\\,dt=\\mathbf{0}$."}, {"label": "b.ii", "html": "$F(2\\pi)=\\displaystyle\\int_0^{2\\pi}\\sqrt t\\sin t\\,dt$. The area from $0$ to $\\pi$ is positive and the area from $\\pi$ to $2\\pi$ is negative."}, {"label": "b.ii", "html": "Because $\\sqrt t$ is larger on the negative half $(\\pi,2\\pi)$ than on the positive half $(0,\\pi)$, the negative area has greater magnitude. Therefore <strong>$F(2\\pi)<0$</strong>."}], "source": "2025 WACE"}, {"id": 73, "year": "2025", "section": "Calculator-Free", "title": "Question 3 — related rate and increments for water level", "topics": "differentiation", "marks": "6 marks", "body": "<p>The water level in a parabolic dish is h(t)=√(8t).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Differentiate h(t).</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find the rate at t=8.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Estimate the change from t=8 to t=8.1.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Rewrite $h(t)=\\sqrt{8t}$ as $(8t)^{1/2}$ before differentiating with the chain rule.", "Evaluate $h'(t)$ at $t=8$ for the exact rate of change after eight seconds.", "For the increase from $8$ to $8.1$ seconds, use $\\delta h\\approx h'(8)(0.1)$."], "solutions": [{"label": "a", "html": "$h(t)=\\sqrt{8t}=(8t)^{1/2}$. Therefore<br>$h'(t)=\\dfrac12(8t)^{-1/2}\\cdot8=\\dfrac{4}{\\sqrt{8t}}=\\dfrac{\\sqrt2}{\\sqrt t}$."}, {"label": "b", "html": "At $t=8$, $h'(8)=\\dfrac{4}{\\sqrt{64}}=\\dfrac48=\\mathbf{0.5}$ cm/s."}, {"label": "c", "html": "Use increments: $\\delta h\\approx h'(8)\\delta t$. Since $\\delta t=8.1-8=0.1$,<br>$\\delta h\\approx0.5(0.1)=\\mathbf{0.05}$ cm."}], "source": "2025 WACE"}, {"id": 74, "year": "2025", "section": "Calculator-Free", "title": "Question 4 — uniform CRV and binomial follow-up", "topics": "crv probability", "marks": "7 marks", "body": "<p>A ride time is uniformly distributed from 5 to 8 minutes, then repeated over three independent days.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Show k=1/3.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find a conditional probability.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Use a binomial model for exactly two days.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["The PDF is uniform from $5$ to $8$, so the rectangle width is $3$ and its height must be $k=\\frac13$.", "For $P(T>5.5\\mid T<6)$, use interval lengths: numerator is the overlap $(5.5,6)$ and denominator is $(5,6)$.", "For three days, success means $7\\le T\\le8$, so $p=\\frac13$; then use the binomial formula for exactly two successes."], "solutions": [{"label": "a", "html": "For a uniform PDF from $5$ to $8$, the rectangle area must be 1. Thus $3k=1$, so <strong>$k=\\dfrac13$</strong>."}, {"label": "b", "html": "$P(T>5.5\\mid T<6)=\\dfrac{P(5.5<T<6)}{P(5<T<6)}=\\dfrac{0.5/3}{1/3}=\\mathbf{\\dfrac12}$."}, {"label": "c", "html": "For one day, $P(7<T<8)=\\dfrac{1}{3}$. Over three independent days, let $Y\\sim B(3,\\frac13)$."}, {"label": "c", "html": "$P(Y=2)=\\binom32\\left(\\dfrac13\\right)^2\\left(\\dfrac23\\right)=\\mathbf{\\dfrac29}$."}], "source": "2025 WACE"}, {"id": 75, "year": "2025", "section": "Calculator-Free", "title": "Question 5 — area between curves", "topics": "integration", "marks": "8 marks", "body": "<p>A shaded region is bounded by a downward parabola, an upward parabola and the x-axis.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Write an integral expression.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Evaluate the area.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Split the shaded area at $x=1$ because the lower boundary changes there.", "From $0$ to $1$ the lower boundary is the $x$-axis; from $1$ to $2$ it is $y=3x^2-6x+3$.", "Use top minus bottom with top $y=-3x^2+\\dfrac{15}{2}x$, then evaluate the two definite integrals and add them."], "solutions": [{"label": "a", "html": "The shaded region is split at $x=1$. From $0$ to $1$, the lower boundary is the $x$-axis. From $1$ to $2$, the lower boundary is $y=3x^2-6x+3$."}, {"label": "a", "html": "An integral expression is<br>$\\displaystyle\\int_0^1\\left(-3x^2+\\dfrac{15}{2}x\\right)dx+\\int_1^2\\left[\\left(-3x^2+\\dfrac{15}{2}x\\right)-(3x^2-6x+3)\\right]dx$."}, {"label": "b", "html": "First integral: $\\displaystyle\\int_0^1\\left(-3x^2+\\dfrac{15}{2}x\\right)dx=\\left[-x^3+\\dfrac{15}{4}x^2\\right]_0^1=\\dfrac{11}{4}$."}, {"label": "b", "html": "Second integral: $\\displaystyle\\int_1^2\\left(-6x^2+\\dfrac{27}{2}x-3\\right)dx=\\dfrac{13}{4}$. Total area $=\\dfrac{11}{4}+\\dfrac{13}{4}=\\mathbf{6}$ square units."}], "source": "2025 WACE"}, {"id": 76, "year": "2025", "section": "Calculator-Free", "title": "Question 6 — interpreting displacement, velocity and acceleration signs", "topics": "kinematics differentiation", "marks": "9 marks", "body": "<p>A table gives signs of displacement, velocity and acceleration for a soccer player.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find when the player returns to the start.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find when the player stops.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Find when the player is slowing down.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Sketch a possible displacement graph.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Returning to the starting position means the displacement $x$ changes sign or equals zero; look at the displacement row.", "Coming to a stop means $v=0$; locate where the velocity sign changes between consecutive times.", "Slowing down occurs when velocity and acceleration have opposite signs; use $v$ for increasing/decreasing and $a$ for concavity in the sketch."], "solutions": [{"label": "a", "html": "The displacement changes from positive to negative between $t=3$ and $t=4$, so the player returns to the starting position <strong>between 3 s and 4 s</strong>."}, {"label": "b", "html": "The player stops when $v=0$. Since the velocity changes from positive to negative between $t=1$ and $t=2$, and from negative to positive between $t=4$ and $t=5$, the player stops in those two intervals."}, {"label": "c", "html": "The player is slowing down when velocity and acceleration have opposite signs. From the table, this occurs at <strong>$t=1$, $t=3$ and $t=4$</strong>."}, {"label": "d", "html": "A valid sketch starts at $x=0$, rises while $v>0$, turns between $1$ and $2$, crosses the axis between $3$ and $4$, turns again between $4$ and $5$, and then rises while remaining below the axis at $t=6$. Concavity should follow the sign of $a$."}], "source": "2025 WACE"}, {"id": 77, "year": "2025", "section": "Calculator-Free", "title": "Question 7 — logarithmic equations and change of base", "topics": "logarithms", "marks": "6 marks", "body": "<p>Solve a natural logarithm equation and use change of base with m=log₃6 and n=log₆5.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Solve 2ln(x)=ln(9)+4.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Express log₃(10) in terms of m and n.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For $2\\ln x=\\ln9+4$, divide by 2 first or rewrite $4$ as $\\ln(e^4)$ before exponentiating.", "Keep the domain $x>0$ because the original equation contains $\\ln x$.", "Use $m=\\log_3 6=\\log_3 2+1$ and $n=\\log_6 5$, so $\\log_3 5=mn$ and $\\log_3 10=\\log_3 2+\\log_3 5$."], "solutions": [{"label": "a", "html": "$2\\ln x=\\ln9+4$ gives $\\ln(x^2)=\\ln9+\\ln(e^4)=\\ln(9e^4)$. Therefore $x^2=9e^4$."}, {"label": "a", "html": "Since $x>0$, <strong>$x=3e^2$</strong>."}, {"label": "b", "html": "$\\log_3 5=\\log_3 6\\cdot\\log_6 5=mn$. Also $m=\\log_3 6=\\log_3(2\\cdot3)=\\log_3 2+1$, so $\\log_3 2=m-1$."}, {"label": "b", "html": "$\\log_3 10=\\log_3(2\\cdot5)=\\log_3 2+\\log_3 5=(m-1)+mn=\\mathbf{m(n+1)-1}$."}], "source": "2025 WACE"}, {"id": 78, "year": "2025", "section": "Calculator-Assumed", "title": "Question 8 — non-replacement probability distribution", "topics": "drv probability", "marks": "8 marks", "body": "<p>Two balls are drawn without replacement from a bag with 2 red and 3 blue balls; X counts red balls.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Complete the distribution.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find mean and variance.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Find the minimum charge for non-negative expected profit.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Modify the game to make X binomial.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Because the balls are drawn without replacement, use a tree diagram or combinations from 2 red and 3 blue for $X=0,1,2$.", "The expected payout is $5E(X)$, since the player receives $5 for each red ball drawn.", "To make $X$ binomial with maximum 2, the two draws must be independent with constant red probability, such as drawing with replacement."], "solutions": [{"label": "a", "html": "$P(X=0)=P(BB)=\\dfrac{\\binom32}{\\binom52}=\\dfrac3{10}$. $P(X=1)=\\dfrac{\\binom21\\binom31}{\\binom52}=\\dfrac6{10}=\\dfrac35$. $P(X=2)=\\dfrac{\\binom22}{\\binom52}=\\dfrac1{10}$."}, {"label": "a", "html": "Completed distribution:<br>$\\begin{array}{c|ccc}x&0&1&2\\\\hline P(X=x)&\\frac3{10}&\\frac35&\\frac1{10}\\end{array}$"}, {"label": "b.i", "html": "$E(X)=0\\cdot\\dfrac3{10}+1\\cdot\\dfrac35+2\\cdot\\dfrac1{10}=\\mathbf{0.8}$."}, {"label": "b.ii", "html": "$E(X^2)=0+1\\cdot\\dfrac35+4\\cdot\\dfrac1{10}=1$. Hence $\\operatorname{Var}(X)=1-(0.8)^2=\\mathbf{0.36}$."}, {"label": "c", "html": "The expected payout is $5E(X)=5(0.8)=4$ dollars. The minimum charge for non-negative expected profit is therefore <strong>$\\$4$</strong>."}, {"label": "d", "html": "Make the two draws independent with constant success probability by replacing the first ball before drawing the second. Then each draw has $P(\\text{red})=\\frac25$ and $X\\sim B(2,\\frac25)$, so the maximum value is still 2."}], "source": "2025 WACE"}, {"id": 79, "year": "2025", "section": "Calculator-Assumed", "title": "Question 9 — apple growth model and maximum rate", "topics": "differentiation logarithms", "marks": "11 marks", "body": "<p>An apple mass model is exponential with a quadratic exponent and is analysed for maturity and maximum growth rate.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find mature mass.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find when mass reaches 100 g.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)–(d)</div><div class=\"wace-part-text\">Locate and calculate the maximum rate of change.</div><div class=\"wace-part-marks\">6 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Use the exact model $m(t)=\\dfrac1{10}e^{t/10-t^2/3000}$ and substitute $t=150$ for the mature mass.", "To find when the apple reaches 100 g, multiply by 10, take natural logs, and solve the resulting quadratic equation in $t$.", "For maximum growth rate, find $g(t)=m'(t)$, then solve $g'(t)=0$ within $0\\le t\\le150$."], "solutions": [{"label": "a", "html": "$m(150)=\\dfrac1{10}e^{150/10-150^2/3000}=\\dfrac1{10}e^{7.5}\\approx\\mathbf{180.8}$ g."}, {"label": "b", "html": "Set $m(t)=100$: $\\dfrac1{10}e^{t/10-t^2/3000}=100$, so $t/10-t^2/3000=\\ln(1000)$."}, {"label": "b", "html": "This gives $t^2-300t+3000\\ln(1000)=0$. The valid solution before maturity is<br>$t=\\dfrac{300-\\sqrt{90000-12000\\ln(1000)}}{2}\\approx\\mathbf{107.8}$ days."}, {"label": "c", "html": "The maximum rate of change is at the steepest point of the graph, visually near the inflection point, about $t\\approx111$ days."}, {"label": "d", "html": "Let $E(t)=t/10-t^2/3000$. Then $m(t)=0.1e^{E(t)}$ and<br>$g(t)=m'(t)=0.1e^{E(t)}\\left(\\dfrac1{10}-\\dfrac{t}{1500}\\right)$."}, {"label": "d", "html": "To maximise $g$, solve $g'(t)=0$. Since $g=mE'$ and $E'=(150-t)/1500$, this gives $(E')^2+E''=0$, so $\\left(\\dfrac{150-t}{1500}\\right)^2=\\dfrac1{1500}$."}, {"label": "d", "html": "The valid solution is $t=150-\\sqrt{1500}\\approx\\mathbf{111.3}$ days. This is when the apple's mass is increasing fastest."}], "source": "2025 WACE"}, {"id": 80, "year": "2025", "section": "Calculator-Assumed", "title": "Question 10 — normal scores and transformed distribution", "topics": "normal probability", "marks": "12 marks", "body": "<p>Australian test scores are normally distributed, then transformed using Y=aX+b.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(d)</div><div class=\"wace-part-text\">Calculate tail, percentile, classification and sample-proportion probabilities.</div><div class=\"wace-part-marks\">7 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)–(f)</div><div class=\"wace-part-text\">Determine transformed mean/SD and recover a,b.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For score probabilities, standardise with $Z=\\dfrac{X-50}{10}$.", "For the sample proportion in part (d), first find $p=P(43\\le X\\le57)$, then use the approximate normal distribution of $\\hat p$ with $n=50$.", "For the transformed scores, convert the two tail probabilities into z-score equations for the new mean and standard deviation of $Y$."], "solutions": [{"label": "a", "html": "$Z=\\dfrac{64-50}{10}=1.4$, so $P(X\\geq64)=P(Z\\geq1.4)\\approx\\mathbf{0.0808}$, or about $8.08\\%$."}, {"label": "b", "html": "Top 1% means $P(X\\geq x)=0.01$, so $z\\approx2.326$. Thus $x=50+10(2.326)\\approx\\mathbf{73.3}$."}, {"label": "c", "html": "$P(43\\leq X\\leq57)=P(-0.7\\leq Z\\leq0.7)\\approx\\mathbf{0.516}$."}, {"label": "d", "html": "Use $p\\approx0.516$ for being classified average. Then $\\hat p\\approx N\\left(0.516,\\dfrac{0.516(1-0.516)}{50}\\right)$."}, {"label": "d", "html": "$P(\\hat p\\leq0.46)=P\\left(Z\\leq\\dfrac{0.46-0.516}{\\sqrt{0.516(0.484)/50}}\\right)\\approx\\mathbf{0.214}$."}, {"label": "e", "html": "$P(Y\\leq82)=0.1151$ gives $z\\approx-1.20$, so $82=\\mu_Y-1.2\\sigma_Y$. $P(Y\\geq130)=0.0228$ gives $z\\approx2.00$, so $130=\\mu_Y+2\\sigma_Y$."}, {"label": "e", "html": "Subtracting gives $48=3.2\\sigma_Y$, so $\\sigma_Y=15$ and $\\mu_Y=100$."}, {"label": "f", "html": "Since $Y=aX+b$, $\\sigma_Y=|a|\\sigma_X$ gives $15=|a|(10)$, so $a=1.5$ for an increasing transformation. Then $100=1.5(50)+b$, so <strong>$a=1.5$, $b=25$</strong>."}], "source": "2025 WACE"}, {"id": 81, "year": "2025", "section": "Calculator-Assumed", "title": "Question 11 — logarithmic stopping-distance model", "topics": "logarithms differentiation", "marks": "4 marks", "body": "<p>Speed and stopping distance satisfy s=40.6 ln(0.15D).</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find speed for D=18.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Differentiate speed with respect to distance.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Compare effect of reducing stopping distance targets.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For part (a), substitute $D=18$ into $s=40.6\\ln(0.15D)$.", "When differentiating, $\\dfrac{d}{dD}\\ln(0.15D)=\\dfrac1D$, so $\\dfrac{ds}{dD}=\\dfrac{40.6}{D}$.", "Since $\\dfrac{40.6}{D}$ is larger for smaller $D$, compare how an 8 m reduction affects lower-target roads versus higher-target roads."], "solutions": [{"label": "a", "html": "For $D=18$, $s=40.6\\ln(0.15\\cdot18)=40.6\\ln(2.7)\\approx\\mathbf{40.3}$ km/h."}, {"label": "b", "html": "$\\dfrac{ds}{dD}=40.6\\cdot\\dfrac{1}{0.15D}\\cdot0.15=\\mathbf{\\dfrac{40.6}{D}}$."}, {"label": "c", "html": "The derivative $\\dfrac{40.6}{D}$ is larger when $D$ is smaller. Therefore reducing the target by 8 m affects roads with lower initial stopping-distance targets more than roads with higher targets. Higher-target main roads are affected less."}], "source": "2025 WACE"}, {"id": 82, "year": "2025", "section": "Calculator-Assumed", "title": "Question 12 — curve, tangent and optimisation", "topics": "differentiation", "marks": "9 marks", "body": "<p>A dog follows a curve while chasing a ball moving along x=4; tangent lines connect dog and ball.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find where the dog reaches the ball.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find the minimum y-value on the path.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Use a tangent to locate the ball.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Point $C$ is on the vertical line $x=4$, so substitute $x=4$ into the dog's path equation.", "For the minimum point, differentiate the path equation and solve $\\dfrac{dy}{dx}=0$.", "For the ball's position, find the tangent line at the dog's given point and extend that tangent to $x=4$."], "solutions": [{"label": "a", "html": "Point $C$ lies on $x=4$. Substitute into $y=-\\dfrac23-\\dfrac13(x-1)\\sqrt{4-x}$: the square-root term is zero, so <strong>$C=(4,-\\dfrac23)$</strong>."}, {"label": "b", "html": "Differentiate $y=-\\dfrac23-\\dfrac13(x-1)\\sqrt{4-x}$. This simplifies to<br>$\\dfrac{dy}{dx}=\\dfrac{x-3}{2\\sqrt{4-x}}$."}, {"label": "b", "html": "Set $\\dfrac{dy}{dx}=0$, giving $x=3$. Then<br>$y(3)=-\\dfrac23-\\dfrac13(2)(1)=-\\dfrac43$. The minimum point is <strong>$(3,-\\dfrac43)$</strong>."}, {"label": "c", "html": "At the dog point $(1,-\\frac23)$, the gradient is $y'(1)=\\dfrac{1-3}{2\\sqrt3}=-\\dfrac1{\\sqrt3}$."}, {"label": "c", "html": "The tangent is $y+\\dfrac23=-\\dfrac1{\\sqrt3}(x-1)$. The ball is on $x=4$, so<br>$y=-\\dfrac23-\\dfrac3{\\sqrt3}=-\\dfrac23-\\sqrt3$. <strong>Ball coordinates: $(4,-\\dfrac23-\\sqrt3)$</strong>."}], "source": "2025 WACE"}, {"id": 83, "year": "2025", "section": "Calculator-Assumed", "title": "Question 13 — CRV model for butterfly life expectancy", "topics": "crv integration", "marks": "8 marks", "body": "<p>A butterfly life expectancy PDF is graphed and then defined by $f(t)=a\\left(\\dfrac{t-1}{3(t-1)^2+1}+\\dfrac14\\right)$ for $0\\leq t\\leq\\dfrac23$.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Assess whether a normal approximation is reasonable.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Shade $P(T\\lt6\\text{ months})$.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Show that $a=\\dfrac{6}{1-\\ln3}$.</div><div class=\"wace-part-marks\">4 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)</div><div class=\"wace-part-text\">Calculate $P(T\\lt6\\text{ months})$.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For the normal-model judgement, compare the PDF with a symmetric bell shape and note its finite support from $0$ to $\\frac23$.", "Six months is $0.5$ years, so the probability is the area under the PDF from $t=0$ to $t=0.5$.", "To find the constant $a$, impose total area 1 over $0\\le t\\le\\frac23$, then reuse that $a$ in the probability integral."], "solutions": [{"label": "a", "html": "A normal approximation is not reasonable: the PDF is bounded between $0$ and $\\frac23$ years and is not symmetric like a normal curve."}, {"label": "b", "html": "Six months is $0.5$ years. Shade the area under the PDF from $t=0$ to $t=0.5$."}, {"label": "c", "html": "Use total area $1$ over $0\\leq t\\leq\\frac23$:<br>$1=a\\displaystyle\\int_0^{2/3}\\left(\\dfrac{t-1}{3(t-1)^2+1}+\\dfrac14\\right)dt$."}, {"label": "c", "html": "An antiderivative is $\\dfrac16\\ln(3(t-1)^2+1)+\\dfrac t4$. Evaluating from $0$ to $\\frac23$ gives $\\dfrac{1-\\ln3}{6}$. Hence <strong>$a=\\dfrac{6}{1-\\ln3}$</strong>."}, {"label": "d", "html": "$P(T<0.5)=\\dfrac{6}{1-\\ln3}\\displaystyle\\int_0^{1/2}\\left(\\dfrac{t-1}{3(t-1)^2+1}+\\dfrac14\\right)dt$."}, {"label": "d", "html": "This equals $\\dfrac{\\ln(7/16)+3/4}{1-\\ln3}\\approx\\mathbf{0.7776}$."}], "source": "2025 WACE"}, {"id": 84, "year": "2025", "section": "Calculator-Assumed", "title": "Question 14 — sinusoidal toothbrush motion", "topics": "differentiation", "marks": "7 marks", "body": "<p>A toothbrush head angle is modelled by a high-frequency sine function.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Find cycles per second.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)</div><div class=\"wace-part-text\">Find the oscillation angle.</div><div class=\"wace-part-marks\">2 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(c)</div><div class=\"wace-part-text\">Find maximum tangential velocity.</div><div class=\"wace-part-marks\">3 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["From $\\theta(t)=\\dfrac{45}{2}\\sin(300\\pi t)$, the period is $\\dfrac{2\\pi}{300\\pi}$.", "The amplitude is $22.5^\\circ$, but the total oscillation angle is from minimum to maximum, so double the amplitude.", "Differentiate $\\theta(t)$ and multiply by the given factor for $v(t)$; maximum speed occurs when the cosine factor has magnitude 1."], "solutions": [{"label": "a", "html": "$\\theta(t)=\\dfrac{45}{2}\\sin(300\\pi t)$. The period is $\\dfrac{2\\pi}{300\\pi}=\\dfrac1{150}$ seconds, so the head completes <strong>150 cycles per second</strong>."}, {"label": "b", "html": "The amplitude is $\\dfrac{45}{2}=22.5^\\circ$. The angle from minimum to maximum is twice the amplitude, so the toothbrush head oscillates through <strong>$45^\\circ$</strong>."}, {"label": "c", "html": "$\\dfrac{d\\theta}{dt}=\\dfrac{45}{2}(300\\pi)\\cos(300\\pi t)=6750\\pi\\cos(300\\pi t)$."}, {"label": "c", "html": "$v(t)=\\dfrac\\pi{300}\\dfrac{d\\theta}{dt}=\\dfrac\\pi{300}(6750\\pi)\\cos(300\\pi t)=\\dfrac{45\\pi^2}{2}\\cos(300\\pi t)$."}, {"label": "c", "html": "The maximum occurs when $\\cos(300\\pi t)=1$, so <strong>$v_{\\max}=\\dfrac{45\\pi^2}{2}\\approx222$ cm/s</strong>."}], "source": "2025 WACE"}, {"id": 85, "year": "2025", "section": "Calculator-Assumed", "title": "Question 15 — binomial robot movement and confidence interval", "topics": "drv probability confidence", "marks": "13 marks", "body": "<p>A robot moves forward/backward with probabilities 0.6 and 0.4, then a confidence interval is built from 100 moves.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)–(c)</div><div class=\"wace-part-text\">Calculate return probabilities and a binomial position probability.</div><div class=\"wace-part-marks\">8 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)–(f)</div><div class=\"wace-part-text\">Use the 100-move result to calculate and interpret a 90% CI.</div><div class=\"wace-part-marks\">5 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["Returning after two moves requires one forward and one backward move: list $FB$ and $BF$ and add their probabilities.", "For 10 moves, net displacement is $5(X-(10-X))$, so translate '20 cm or more forward' into an inequality for $X$.", "After 100 moves back at the origin, forward and backward moves must be equal, so use $\\hat p=50/100$ for the confidence interval."], "solutions": [{"label": "a", "html": "Returning after 2 moves requires one forward and one backward move: $FB$ or $BF$. Probability $=0.6(0.4)+0.4(0.6)=\\mathbf{0.48}$."}, {"label": "b", "html": "After 3 moves, an equal number of forward and backward 5 cm moves is impossible because 3 is odd. Therefore the probability of returning to the original position is <strong>0</strong>."}, {"label": "c.i", "html": "Let $X$ be the number of forward moves in 10 moves. Then <strong>$X\\sim B(10,0.6)$</strong>."}, {"label": "c.ii", "html": "Net displacement after 10 moves is $5(X-(10-X))=10X-50$. For at least $20$ cm forward, $10X-50\\geq20$, so $X\\geq7$."}, {"label": "c.ii", "html": "$P(X\\geq7)=\\displaystyle\\sum_{x=7}^{10}\\binom{10}{x}(0.6)^x(0.4)^{10-x}\\approx\\mathbf{0.3823}$."}, {"label": "d", "html": "After 100 moves, being back at the original position means forward and backward moves are equal. Therefore the robot made <strong>50 forward moves</strong>."}, {"label": "e", "html": "$\\hat p=\\dfrac{50}{100}=0.5$. A 90% confidence interval is<br>$0.5\\pm1.645\\sqrt{\\dfrac{0.5(0.5)}{100}}=0.5\\pm0.0823$, so <strong>$(0.418,0.582)$</strong>."}, {"label": "f", "html": "The manufacturer's claimed value $0.6$ is outside this interval, so the sample gives evidence against the claim. It does not prove the claim is incorrect with certainty; it is a statistical conclusion."}], "source": "2025 WACE"}, {"id": 86, "year": "2025", "section": "Calculator-Assumed", "title": "Question 16 — confidence interval for a medical proportion", "topics": "confidence probability", "marks": "12 marks", "body": "<p>A medical-record sample of 71 athletes gives 25 with exercise-induced asthma.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Identify bias.</div><div class=\"wace-part-marks\">1 mark</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)–(c)</div><div class=\"wace-part-text\">Calculate a 95% confidence interval and margin.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(d)–(e)</div><div class=\"wace-part-text\">Discuss changes to margin and find required sample size.</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(f)</div><div class=\"wace-part-text\">Compare with a 20% American proportion.</div><div class=\"wace-part-marks\">2 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["For bias, the sample includes athletes referred by doctors and recorded in a repository, not every athlete with unexplained symptoms.", "Calculate $\\hat p=\\frac{25}{71}$, then use the 95% interval formula $\\hat p\\pm1.96\\sqrt{\\hat p(1-\\hat p)/71}$.", "For the guaranteed sample size, use $p(1-p)=0.25$ and round up; for the final comparison, check whether $0.20$ lies inside the interval."], "solutions": [{"label": "a", "html": "A possible bias is that the sample only includes athletes referred by a doctor and recorded in the repository. This may overrepresent athletes with more serious or persistent symptoms."}, {"label": "b", "html": "$\\hat p=\\dfrac{25}{71}\\approx0.3521$. A 95% CI is<br>$0.3521\\pm1.96\\sqrt{\\dfrac{0.3521(1-0.3521)}{71}}$."}, {"label": "b", "html": "The margin is about $0.1111$, so the interval is <strong>$(0.241,\\,0.463)$</strong>."}, {"label": "c", "html": "The margin of error is <strong>$0.111$</strong>, or about $11.1$ percentage points."}, {"label": "d.i", "html": "If sample size is increased, the margin of error decreases because $n$ is in the denominator of the square root."}, {"label": "d.ii", "html": "If the confidence level is increased, the critical $z$ value increases, so the margin of error increases."}, {"label": "d.iii", "html": "If $\\hat p$ decreases from about $0.352$, then $\\hat p(1-\\hat p)$ moves farther from its maximum at $0.5$, so the margin of error decreases."}, {"label": "e", "html": "To guarantee margin at most $0.04$ for 95%, use $p(1-p)\\leq0.25$:<br>$n\\geq\\dfrac{1.96^2(0.25)}{0.04^2}=600.25$. Round up to <strong>$601$</strong>."}, {"label": "f", "html": "The American proportion $0.20$ is not inside $(0.241,0.463)$. The interval suggests the Australian proportion is different from, and higher than, $20\\%$."}], "source": "2025 WACE"}, {"id": 87, "year": "2025", "section": "Calculator-Assumed", "title": "Question 17 — decibel logarithmic scale", "topics": "logarithms", "marks": "13 marks", "body": "<p>Sound intensity level is L=10log₁₀(I/I₀), with normal conversation at 60 dB.</p><div class=\"wace-q-parts\"><div class=\"wace-q-part\"><div class=\"wace-part-label\">(a)</div><div class=\"wace-part-text\">Compare intensities at 90 dB and 60 dB.</div><div class=\"wace-part-marks\">3 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(b)–(d)</div><div class=\"wace-part-text\">Find reference intensity and rewrite as a linear function of log₁₀(I).</div><div class=\"wace-part-marks\">6 marks</div></div><div class=\"wace-q-part\"><div class=\"wace-part-label\">(e)–(f)</div><div class=\"wace-part-text\">Graph/use the logarithmic model.</div><div class=\"wace-part-marks\">4 marks</div></div></div>", "breakdown": ["Identify the topic and formula or rule being tested.", "Set up the calculation from the information in the question, keeping units and conditions clear.", "Complete the algebra or probability calculation, then interpret the final result in the wording of the question."], "hints": ["To compare 90 dB and 60 dB, subtract the two log equations so the reference intensity cancels and only the intensity ratio remains.", "Use the normal conversation fact $60=10\\log_{10}(10^{-6}/I_0)$ to solve for the reference intensity $I_0$.", "After finding $I_0$, expand the log quotient to get a straight-line equation in $\\log_{10}(I)$; for $I=10000$, use $\\log_{10}(I)=4$."], "solutions": [{"label": "a", "html": "Compare 90 dB with 60 dB:<br>$90-60=10\\log_{10}\\left(\\dfrac{I_{90}}{I_{60}}\\right)$. Thus $3=\\log_{10}\\left(\\dfrac{I_{90}}{I_{60}}\\right)$, so the intensity factor is <strong>$10^3=1000$</strong>."}, {"label": "b", "html": "At the reference intensity, $I=I_0$, so $L=10\\log_{10}(1)=\\mathbf{0}$ dB."}, {"label": "c", "html": "For normal conversation, $60=10\\log_{10}\\left(\\dfrac{10^{-6}}{I_0}\\right)$. Hence $\\log_{10}\\left(\\dfrac{10^{-6}}{I_0}\\right)=6$, so $\\dfrac{10^{-6}}{I_0}=10^6$ and <strong>$I_0=10^{-12}$ W/m$^2$</strong>."}, {"label": "d", "html": "Using $I_0=10^{-12}$,<br>$L=10\\log_{10}\\left(\\dfrac{I}{10^{-12}}\\right)=10\\big(\\log_{10}I+12\\big)=\\mathbf{10\\log_{10}(I)+120}$."}, {"label": "e", "html": "The graph of $L$ against $\\log_{10}(I)$ is a straight line with gradient $10$ and vertical intercept $120$. For example, it passes through $(0,120)$ and $(4,160)$."}, {"label": "f", "html": "If $I=10000=10^4$, then $\\log_{10}(I)=4$. Substituting gives $L=10(4)+120=\\mathbf{160}$ dB."}], "source": "2025 WACE"}];



// Detailed guided WACE breakdowns for 2024–2025 additions.
// These replace generic prompts with part-by-part walkthroughs that guide the method without giving final answers.
const WACE_GUIDED_BREAKDOWNS = {
  54: [
    'For (a), identify this as a product: $x^2\\ln(4x+3)$. Set $u=x^2$ and $v=\\ln(4x+3)$, then use the product rule with the chain rule on the logarithm.',
    'For (b), notice that $g\’(x)=\\dfrac{3x}{3x^2+1}$ has the form constant times $\\dfrac{u\’}{u}$. Let $u=3x^2+1$ and adjust for the factor $6x$.',
    'After integrating $g\’(x)$, write $g(x)=\\text{log expression}+c$. Use $g(1)=\\ln(6)$ to form an equation for $c$ before simplifying the final expression.',
    'Before revealing the answer, check that differentiating your $g(x)$ gives exactly $\\dfrac{3x}{3x^2+1}$.'
  ],
  55: [
    'Start by differentiating $x(t)$ to get velocity $v(t)$, then differentiate again to get acceleration $a(t)$. Keep the units: $v$ is cm/s and $a$ is cm/s$^2$.',
    'For the initial velocity, substitute $t=0$ into $v(t)$, not into the position table.',
    'To decide whether the graphic is initially speeding up or slowing down, compare the signs of $v(0)$ and $a(0)$. Same sign means speed increasing; opposite signs means speed decreasing.',
    'For $\\int_3^9 v(t)dt$, use the Fundamental Theorem: it equals the change in position from $t=3$ to $t=9$. Use the table to interpret it as displacement.',
    'For total distance, locate the times where $v(t)=0$ inside $0\\le t\\le15$. Split the motion at those turning times and add the absolute changes in position on each interval.'
  ],
  56: [
    'Use the cumulative table to work backwards: $P(X\\le x)$ is the running total of the probability table up to that value of $x$.',
    'Fill missing probabilities by subtracting consecutive cumulative probabilities, for example $P(X=2)=P(X\\le2)-P(X\\le1)$.',
    'For $P(2\\le X\\le4)$, add the individual probabilities for $X=2,3,4$ rather than using only one table entry.',
    'For $P(X=1\\mid X\\le3)$, write the conditional probability fraction first: numerator $P(X=1\\cap X\\le3)$, denominator $P(X\\le3)$.',
    'Only simplify after the correct event has been identified; this avoids mixing up point probabilities and cumulative probabilities.'
  ],
  57: [
    'For the uniform CRV, use the mean formula $E(X)=\\dfrac{a+b}{2}$. You are given the mean and the maximum, so work backwards to find the minimum endpoint.',
    'Once the two endpoints are known, use $\\operatorname{Var}(X)=\\dfrac{(b-a)^2}{12}$ for a continuous uniform distribution.',
    'For the binomial part, write the two equations from the mean and variance: $np=\\dfrac12$ and $np(1-p)=\\dfrac{5}{12}$.',
    'Divide the variance equation by the mean equation to isolate $1-p$, then find $p$ and $n$.',
    'Finally use the binomial probability formula for $P(W=1)$, substituting the $n$ and $p$ values you found.'
  ],
  58: [
    'Read the graph as giving values of $\\log_a(x)$ in multiples of $p$. Use points such as $x=2,4,8$ to recognise the repeated doubling pattern.',
    'For $\\log_a(0.5)$, connect $0.5$ to $2^{-1}$ and use the log law $\\log_a(x^{-1})=-\\log_a(x)$.',
    'For $a^{5p}$, first interpret $p$ from the graph as a logarithm value. Then convert from logarithmic form to index form.',
    'For $\\log_a(x-3)=3p$, use the graph/log relationship to replace $3p$ with the matching input value, then solve for $x$.',
    'For the transformed graphs, compare each curve with the original: check whether the vertical asymptote has shifted horizontally or whether the whole graph has shifted vertically.'
  ],
  59: [
    'Identify the exact interval of integration from the bounds shown on the graph. The shaded area is under $y=x\\sin(\\pi x)$ between those two $x$-values.',
    'For the rectangle bound, treat each rectangle area as width $\\times$ height. Use exact sine values at the marked endpoints.',
    'Decide which rectangles form the lower sum and which form the upper sum by checking whether the function is increasing or decreasing on each subinterval.',
    'Write the lower bound as the sum of the lower rectangles and the upper bound as the sum of the upper rectangles. Do not estimate decimals if exact values are expected.',
    'For the improvement suggestion, mention a method that makes the rectangle approximation closer, such as using more, thinner rectangles.'
  ],
  60: [
    'Convert $45^\\circ$ to radians before substituting into a formula where $\\theta$ is in radians.',
    'For the derivative, treat the speed formula as a quotient or rewrite it as a power expression, then differentiate carefully with respect to $\\theta$.',
    'Use the result from the derivative part to build $\\dfrac{ds}{d\\theta}$. The question says “hence”, so your earlier derivative should appear in the working.',
    'For the increments formula, use $\\delta s\\approx \\dfrac{ds}{d\\theta}\\delta\\theta$ evaluated at $\\theta=\\pi/4$.',
    'Convert the angle change from $1^\\circ$ to radians before using it as $\\delta\\theta$.'
  ],
  61: [
    'For the medication remaining after 10 hours, substitute $t=10$ directly into $A(t)$ and keep the answer in milligrams.',
    'For the half-life, set $A(t)$ equal to half the initial amount. Divide out the initial amount before taking natural logs.',
    'For the rate after 24 hours, differentiate $A(t)$ first. The negative sign indicates decreasing mass, so state the rate in context.',
    'For the dosing interval, set $B(T)=8.85$ and solve the exponential equation for $T$ using logarithms.',
    'For the increments part, differentiate $B(T)$ with respect to $T$, evaluate at the interval from part (d), and use $\\delta T=0.5$ hours.'
  ],
  62: [
    'For the first confidence interval, calculate $\\hat p$ from heads divided by total flips, then use $\\hat p\\pm z\\sqrt{\\hat p(1-\\hat p)/n}$ with the 90% $z$ value.',
    'For the random variable $X$, interpret “contains the true proportion” as a success for each student. There are 20 independent intervals and success probability is the confidence level.',
    'State the binomial model using $n=20$ and the confidence-level probability, then use $E(X)=np$ and $\\operatorname{Var}(X)=np(1-p)$.',
    'For “three students do not contain the true proportion”, define failure probability as $1-$confidence level, then use the binomial probability for exactly three failures.',
    'Check that your model is counting students, not coin flips.'
  ],
  63: [
    'For the bias part, focus on how “first 200 books”, “6-hour window”, and “newest printing press” may fail to represent the whole print run.',
    'For reducing bias, suggest changes that spread the sample across presses and times, and make selection random rather than convenient.',
    'For the normal approximation, use the publisher’s claimed error rate as $p$ and sample size $n=200$. Check the large-sample conditions before using the normal model for $\\hat p$.',
    'For the given sample and margin, the confidence interval is simply $\\hat p\\pm E$. Use the interval to judge whether the claimed proportion lies inside it.',
    'For the minimum sample size, use the maximum margin-of-error formula with $\\hat p=0.5$ if the question asks to guarantee the margin. Round up to the next whole number.'
  ],
  64: [
    'The interval width is twice the margin of error. Start by finding the margin from the given width, then centre the interval at the sample proportion.',
    'To find the sample size, substitute $\\hat p=0.70$, $E=\\text{half-width}$ and $z=1.96$ into $E=z\\sqrt{\\hat p(1-\\hat p)/n}$, then solve for $n$.',
    'For the protest group’s claim, compare the claimed proportion with the confidence interval. The reasoning should mention whether the claim lies inside or outside the interval.',
    'When comparing Brisbane and Sydney, keep $\\hat p$ the same and compare sample sizes: larger $n$ gives a smaller margin.',
    'When comparing Brisbane and Hobart, keep $n$ the same and compare $\\hat p(1-\\hat p)$, because that controls the standard error.'
  ],
  65: [
    'Use the square beam to determine the log radius: the diameter of the circle is the diagonal of the square cross-section.',
    'For the sideboard formula, relate the horizontal half-width to the circle using Pythagoras. Express $y$ in terms of $x$ before multiplying to get area.',
    'To maximise $A(x)$, differentiate the given expression. Because it contains a square root, product rule plus chain rule is required.',
    'Set $A\'(x)=0$ and solve for the physically valid value of $x$ within the allowed geometric range.',
    'Once $x$ is found, substitute back into the geometry relation for $y$. Finish by checking the dimensions make sense inside the circular log.'
  ],
  66: [
    'For the standard deviation, translate the statement $P(X>400)=0.2525$ into a standard normal equation involving $z=\\dfrac{400-350}{\\sigma}$.',
    'Use inverse normal/CAS to find the corresponding $z$ value, then solve for $\\sigma$.',
    'For the Albany probability, use the normal model with the mean and standard deviation now known, then calculate $P(X>420)$.',
    'For the miles transformation, use $Y=X/1.6$. Means scale by $1/1.6$ and variances scale by $(1/1.6)^2$.',
    'For the histogram comparison, comment on shape, symmetry and outliers before deciding whether a normal model is reasonable.',
    'To estimate Spruky’s expected distance, multiply each class midpoint by its relative frequency and add the products.'
  ],
  67: [
    'Use the experimental frequencies to estimate probabilities by relative frequency: probability equals frequency divided by total trials.',
    '“Not winning in two or less rolls” means the complement of $X\\le2$. Add the frequencies for one and two rolls first, then subtract from the total.',
    'To explain why the model is not binomial, check the binomial requirements: fixed number of trials, independent identical trials, two outcomes per trial and constant success probability.',
    'For the profit distribution, list the possible player profits after accounting for the $1 game cost. Then group the $X$ outcomes that produce each profit.',
    'Find $E(Y)$ by summing $yP(Y=y)$, and find $\\operatorname{Var}(Y)$ using $E(Y^2)-[E(Y)]^2$.',
    'For the charity conclusion, remember $Y$ is player profit. The charity’s long-run profit has the opposite sign.'
  ],
  68: [
    'From the graph, use $M_0=3.16\\times10^{13}$ by first identifying $\\log_{10}(M_0)$. Then read the corresponding $M_w$ value from the line.',
    'To find $a$ and $b$ in $M_w=a\\log_{10}(M_0)+b$, choose two clear points from the line and calculate gradient and intercept.',
    'To rewrite as $a\\log_{10}(M_0/c)$, use $\\log_{10}(M_0/c)=\\log_{10}(M_0)-\\log_{10}(c)$. Match this form to your line equation.',
    'For a given magnitude, substitute $M_w=4$ into the equation and solve for $\\log_{10}(M_0)$ first.',
    'Convert back from logarithmic form using $M_0=10^{\\text{your log value}}$.'
  ],
  69: [
    'For the first volume, find the horizontal limits where the parabolic side reaches the shampoo height $y=10$.',
    'Express the cross-sectional shampoo area as an integral with respect to $x$: top boundary minus bottom boundary across the filled region.',
    'Multiply the cross-sectional area by the constant bottle width of 4 cm to convert area to volume.',
    'After the bottle is inverted, set up a new area integral using the inverted parabola and unknown height $h$.',
    'Equate the new volume to the volume from part (a), then solve for $h$. Keep only the height that fits the diagram.'
  ],
  70: [
    'Use the initial condition at $t=0$ to form the first equation for $b$ and $c$. Since $\\log_4(1)=0$, this immediately identifies $c$.',
    'Use the end-of-week-one information to form a second equation at $t=1$. Be careful that “learnt an additional 32” means total known is initial known plus 32.',
    'Solve the two equations for $b$ and $c$, then write the full model before using it.',
    'For 26 weeks, substitute $t=26$ and evaluate the logarithm with the model parameters.',
    'For the lifetime judgement, set the model equal to 493 and solve for $t$. Compare the required time with a realistic human lifetime.'
  ],
  71: [
    'For the mean, use $E(X)=\\int x p(x)\,dx$ over the support of the PDF. Substitute the given $p(x)$ before simplifying the integrand.',
    'The integrand contains $x\\ln x$-type terms, so prepare to use integration by parts or a known antiderivative for $\\int x\\ln x\,dx$.',
    'For the median, write the defining equation $\\int_{\\text{lower}}^M p(x)\,dx=0.5$.',
    'Find the CDF expression by integrating the PDF up to $M$, then solve the resulting logarithmic equation exactly.',
    'Check that your median lies inside the support of the distribution.'
  ],
  72: [
    'For $F\'(x)$, apply the Fundamental Theorem of Calculus: the derivative of an area function with upper limit $x$ is the integrand evaluated at $x$.',
    'For $F(0)$, interpret the integral from $0$ to $0$ geometrically before doing any calculation.',
    'For $F(2\\pi)$, think of signed area. Compare the positive area on $[0,\\pi]$ with the negative area on $[\\pi,2\\pi]$.',
    'Use the graph: the negative lobe has larger magnitude because $\\sqrt{x}$ is larger on the later interval.',
    'State the sign of $F(2\\pi)$ with a sentence explaining the balance of signed areas.'
  ],
  73: [
    'Rewrite $h(t)=\\sqrt{8t}$ as $(8t)^{1/2}$ before differentiating. Use the chain rule and then simplify.',
    'For the rate at $t=8$, substitute $t=8$ into $\\dfrac{dh}{dt}$, not into $h(t)$.',
    'For the increments estimate, use $\\delta h\\approx \\dfrac{dh}{dt}\\delta t$ at $t=8$.',
    'The time change from $8$ to $8.1$ is $\\delta t=0.1$ seconds.',
    'Include units: $\\dfrac{dh}{dt}$ is cm/s and $\\delta h$ is cm.'
  ],
  74: [
    'For the uniform PDF, the total area of the rectangle must be 1. Use base length times height to show the value of $k$.',
    'For the conditional probability, set up $P(T>5.5\\mid T<6)=\\dfrac{P(5.5<T<6)}{P(T<6)}$ and use rectangle lengths because the density is constant.',
    'For the three-day question, first find the probability that one ride takes between 7 and 8 minutes.',
    'Then model the number of days in that interval as a binomial random variable with $n=3$ and that success probability.',
    'Use $P(X=2)=\\binom32p^2(1-p)$ for exactly two days.'
  ],
  75: [
    'Find all boundary curves of the shaded region and identify where the upper and lower curves change.',
    'Use the intersection points shown on the graph to decide the correct integration limits. The shaded region may need to be split into more than one integral.',
    'For each subinterval, write area as $\\int(\\text{top curve}-\\text{bottom curve})\,dx$.',
    'Only after the setup is correct should you integrate the polynomial expressions.',
    'Evaluate each definite integral and add the pieces to get the total shaded area.'
  ],
  76: [
    'Returning to the starting position means $x$ changes sign or reaches zero. Use the sign row for displacement to locate the interval.',
    'Coming to a stop means $v=0$. Look for intervals where the velocity sign changes from positive to negative or negative to positive.',
    'A player is slowing down when velocity and acceleration have opposite signs. Check each integer time using the signs in the table.',
    'For the sketch, start at $x=0$ and use the sign of $v$ to decide increasing/decreasing, and the sign of $a$ to decide concavity.',
    'Mark turning points where $v$ changes sign and an $x$-axis crossing where displacement changes sign.'
  ],
  77: [
    'For $2\\ln x=\\ln9+4$, combine or divide carefully before exponentiating. Remember that $4$ can be written as $\\ln(e^4)$ if you want one logarithm.',
    'After solving, keep only $x>0$ because the original logarithm requires a positive input.',
    'For the change-of-base part, use $m=\\log_3 6$ and $n=\\log_6 5$ to build $\\log_3 5$ through the product rule for logs across bases.',
    'Write $10=2\\cdot5$ and express $\\log_3 10=\\log_3 2+\\log_3 5$.',
    'Use $6=2\\cdot3$ to express $\\log_3 2$ in terms of $m$.'
  ],
  78: [
    'This is drawing without replacement, so list the possible values $X=0,1,2$ and use combinations or a tree diagram for each probability.',
    'For $E(X)$, multiply each possible number of red balls by its probability and add.',
    'For variance, use either $\\sum p(x-\\mu)^2$ or $E(X^2)-[E(X)]^2$. The second method is usually faster once the table is complete.',
    'For the minimum charge, calculate the expected payout first: each red ball wins $5$, so expected payout is $5E(X)$.',
    'For the binomial modification, explain how to make the two draws independent with constant red probability and fixed number of trials.'
  ],
  79: [
    'For the mature mass, substitute $t=150$ into the model, because the apple stops growing after that time.',
    'To find when the mass reaches 100 g, set $m(t)=100$ and solve the exponential equation. Taking natural logs will lead to an equation in $t$ that may require CAS.',
    'The maximum rate of change occurs at the steepest point of the mass graph, visually near the inflection point.',
    'For the calculus proof, differentiate $m(t)$ to obtain $g(t)=m\’(t)$. Use product/chain rules on the exponential expression.',
    'To maximise $g(t)$, solve $g\’(t)=0$ and choose the solution in the interval $0\\le t\\le150$. Interpret it as days after growth begins.'
  ],
  80: [
    'For the first normal probability, standardise with $Z=\\dfrac{X-50}{10}$ and calculate the upper tail.',
    'For the top 1%, use inverse normal: find the score $x$ such that $P(X\\ge x)=0.01$.',
    'For the “average” classification, calculate $P(43\\le X\\le57)$ using the normal CDF.',
    'For the sample proportion, first use the “average” probability as the population proportion $p$, then apply the approximate normal distribution of $\\hat p$.',
    'For the transformed scores, translate the two probability statements into z-score equations for the new mean and standard deviation.',
    'Once the mean and SD of $Y$ are known, use $Y=aX+b$: $\\mu_Y=a\\mu_X+b$ and $\\sigma_Y=|a|\\sigma_X$.'
  ],
  81: [
    'For the speed limit, substitute the stopping-distance target into $s=40.6\\ln(0.15D)$.',
    'For the derivative, use $\\dfrac{d}{dD}\\ln(0.15D)=\\dfrac1D$ after the constant inside the log cancels through the chain rule.',
    'To compare the effect of reducing $D$ by 8 m, use the size of $\\dfrac{ds}{dD}$ at different $D$ values.',
    'Since $\\dfrac{ds}{dD}$ is larger for smaller $D$, decide whether lower-target or higher-target roads are more affected.',
    'Answer the comparison in words, linking it back to local roads versus main roads.'
  ],
  82: [
    'Point $C$ lies where the dog reaches the ball on the vertical line $x=4$. Substitute $x=4$ into the path equation to get its $y$-coordinate.',
    'For the minimum $y$ value on the dog’s path, differentiate the path equation with respect to $x$.',
    'Set $\\dfrac{dy}{dx}=0$ and solve for the $x$-coordinate of the lowest point. Substitute this $x$ back into the path equation for $y$.',
    'For the ball position when the dog is at the given point, find the tangent line to the curve at that dog point.',
    'The ball is on the vertical line $x=4$, so extend the tangent line to $x=4$ and calculate the corresponding $y$-coordinate.'
  ],
  83: [
    'For the normal approximation judgement, compare the graphed PDF with a normal curve: look for symmetry, bell shape and finite/one-sided support.',
    'For the shading, remember six months is $0.5$ years, so shade the area under the PDF from the left endpoint up to $t=0.5$.',
    'To show the constant, use the PDF condition $\\int f(t)\,dt=1$ over its support. Split the integral if the PDF is piecewise.',
    'Carry out the integration symbolically and solve the resulting equation for $a$ without rounding.',
    'For $P(T<6\\text{ months})$, integrate the PDF from the lower bound to $0.5$, then substitute your exact $a$ value before rounding.'
  ],
  84: [
    'Read the sine model $\\theta(t)$ and identify its angular coefficient. The period is $\\dfrac{2\\pi}{\\text{angular coefficient}}$.',
    'Cycles per second is the reciprocal of the period, so find how many periods fit into one second.',
    'The angle through which the head oscillates is the distance from maximum angle to minimum angle, not just the amplitude.',
    'For tangential velocity, differentiate $\\theta(t)$ with respect to time and multiply by the given scale factor in the velocity formula.',
    'The maximum velocity occurs when the cosine factor from differentiating the sine has magnitude 1. Use that to find the maximum speed.'
  ],
  85: [
    'For return after 2 moves, list the two possible sequences that end at the original position: forward then backward, or backward then forward.',
    'For return after 3 moves, reason using parity: an odd number of 5 cm moves cannot produce a net displacement of zero.',
    'For $X$, define success as a forward move. The number of forward moves in 10 independent moves follows a binomial distribution.',
    'Convert “20 cm or more forward” into a condition on the number of forward moves. Net displacement is $5(\#F-\#B)$ and $\#B=10-\#F$.',
    'For the 100-move result, being back at the origin means the number of forward and backward moves is equal.',
    'Build the 90% confidence interval from $\\hat p=$ forward moves divided by 100. Use it to discuss whether 0.6 is plausible, but avoid saying the interval proves certainty.'
  ],
  86: [
    'For the bias part, ask whether the sampling frame includes all relevant athletes or only those referred into the medical-record repository.',
    'Compute $\\hat p$ from 25 successes out of 71 before constructing the 95% confidence interval.',
    'Use $\\hat p\\pm1.96\\sqrt{\\hat p(1-\\hat p)/n}$ for the interval, and identify the margin as the amount added/subtracted from $\\hat p$.',
    'For changes to margin, remember larger $n$ reduces margin and higher confidence level increases the $z$ value, increasing margin.',
    'For changing $\\hat p$, compare $\\hat p(1-\\hat p)$ values. The margin is largest near $\\hat p=0.5$ and smaller when $\\hat p$ moves away from 0.5.',
    'For required sample size, use the conservative worst-case value $\\hat p=0.5$ unless the question says otherwise, then round up.',
    'To compare with 20%, check whether 0.20 lies inside the confidence interval and state the conclusion in context.'
  ],
  87: [
    'For comparing 90 dB with 60 dB, subtract the two sound-level equations so the reference intensity cancels. Then convert the log difference into an intensity ratio.',
    'For reference intensity, substitute the known normal conversation intensity and sound level into $L=10\\log_{10}(I/I_0)$, then solve for $I_0$.',
    'To rewrite as $L=a\\log_{10}(I)+b$, expand $\\log_{10}(I/I_0)$ using the quotient law.',
    'Identify the gradient $a$ and intercept $b$ from the simplified equation in terms of $\\log_{10}(I)$.',
    'For the graph, plot $L$ against $\\log_{10}(I)$ as a straight line using two convenient points.',
    'For $I=10000$, first find $\\log_{10}(I)$, then read or substitute this horizontal value into the line.'
  ]
};

// Question-specific WACE hints for 2024–2025 additions.
// These replace the earlier generic hints and are designed as progressive nudges, not answer reveals.
const WACE_SPECIFIC_HINTS = {
  "54": [
    "For part (a), treat $x^2\\ln(4x+3)$ as a product: $u=x^2$ and $v=\\ln(4x+3)$.",
    "The derivative of the log factor is $\\dfrac{4}{4x+3}$, so the product rule has two terms: $u'v+uv'$.",
    "For part (b), rewrite $\\dfrac{3x}{3x^2+1}$ as $\\dfrac12\\cdot\\dfrac{6x}{3x^2+1}$, then use $g(1)=\\ln6$ to find the constant."
  ],
  "55": [
    "Differentiate the position: $v(t)=t^2-14t+40$, then differentiate again for $a(t)=2t-14$.",
    "For initial speeding/slowing, compare the signs of $v(0)$ and $a(0)$; same signs mean speeding up, opposite signs mean slowing down.",
    "For total distance, solve $v(t)=0$ to find the direction changes, split at $t=4$ and $t=10$, then add absolute changes in position."
  ],
  "56": [
    "Use the jumps in the cumulative table: $P(X=x)=F(x)-F(\\text{previous value})$.",
    "For $P(2\\le X\\le4)$, add the individual probabilities for $X=2$, $X=3$ and $X=4$.",
    "For $P(X=1\\mid X\\le3)$, the numerator is $P(X=1)$ and the denominator is $P(X\\le3)$."
  ],
  "57": [
    "For the uniform variable, use $E(X)=\\dfrac{a+b}{2}$. You know the mean is $6$ and the maximum is $9$, so work backwards to the minimum endpoint.",
    "For the binomial variable, write $np=\\dfrac12$ and $np(1-p)=\\dfrac{5}{12}$. Dividing the equations isolates $1-p$.",
    "Once $n$ and $p$ are known, use $P(W=1)=\\binom n1p(1-p)^{n-1}$."
  ],
  "58": [
    "Use the graph values as log facts: for example, the curve shows inputs such as $2,4,8$ matching heights $p,2p,3p$.",
    "For $\\log_a(0.5)$, rewrite $0.5$ as $2^{-1}$ and use the power law for logarithms.",
    "For the transformed graphs, compare each curve's asymptote and vertical position with the original $f(x)=\\log_a x$."
  ],
  "59": [
    "The shaded integral is the area under $y=x\\sin(\\pi x)$ from $x=\\frac16$ to $x=\\frac12$.",
    "Use rectangle widths of $\\frac16$ and exact heights at $x=\\frac16$, $x=\\frac13$ and $x=\\frac12$.",
    "Choose lower and upper rectangles by checking whether the function is increasing or decreasing on each small interval; more thinner rectangles improve the estimate."
  ],
  "60": [
    "Convert angles first: $45^\\circ=\\frac\\pi4$, and a $1^\\circ$ change is $\\frac\\pi{180}$ radians.",
    "Differentiate the speed formula with respect to $\\theta$ carefully; the question's 'hence' means the derivative from part (b) should be reused.",
    "For the increments estimate, use $\\delta s\\approx s'(\\pi/4)\\,\\delta\\theta$ with $\\delta\\theta=\\frac\\pi{180}$."
  ],
  "61": [
    "For $A(t)$, substitute $t=10$ directly. For the half-life, set $5e^{-0.0173t}=2.5$ before taking natural logs.",
    "For the rate of decrease, differentiate: $A'(t)=-0.0865e^{-0.0173t}$, then evaluate at $t=24$.",
    "For the dosing interval, solve $\\dfrac5{1-e^{-0.0173T}}=8.85$; for the increments part use $\\delta T=0.5$ hours."
  ],
  "62": [
    "For the teacher's interval, use $\\hat p=\\frac{30}{50}$ and the 90% critical value $z\\approx1.645$.",
    "A student's interval containing the true proportion is a success with probability $0.90$, so model $X$ with $n=20$ and $p=0.90$.",
    "'Three students do not contain the true proportion' means exactly three failures, so use failure probability $0.10$."
  ],
  "63": [
    "For bias, focus on 'first 200 books', the 6-hour window, and using only the newest press; these may not represent the whole print run.",
    "For the sample-proportion probability, use the publisher's claimed rate $p=0.05$ with $n=200$ in the normal approximation for $\\hat p$.",
    "For the guaranteed sample size, use the margin formula with worst-case $\\hat p(1-\\hat p)=0.25$, then round the result up."
  ],
  "64": [
    "The interval width $0.096$ is twice the margin of error, so start with $E=0.048$ centred on $\\hat p=0.70$.",
    "To find the sample size, solve $0.048=1.96\\sqrt{\\dfrac{0.7(0.3)}{n}}$.",
    "For comparing widths, larger sample size narrows the interval; if sample sizes are equal, compare $\\hat p(1-\\hat p)$."
  ],
  "65": [
    "The square beam has side $40$ cm, so the circle's diameter is the beam's diagonal $40\\sqrt2$.",
    "For the sideboard area, use the circle geometry to express the sideboard width $y$ in terms of $x$, then use $A=2xy$.",
    "To maximise $A(x)=2x\\sqrt{400-40x-x^2}$, differentiate with product and chain rules, set $A\'(x)=0$, then recover $y$."
  ],
  "66": [
    "Use $P(X>400)=0.2525$ to form the standardised equation $z=\\dfrac{400-350}{\\sigma}$.",
    "For miles, $Y=X/1.6$, so the mean is divided by $1.6$ and the variance is divided by $1.6^2$.",
    "For Spruky, estimate the mean from the histogram using class midpoints multiplied by frequencies, then divide by 200."
  ],
  "67": [
    "Estimate probabilities from the bar chart by dividing each frequency by 500, e.g. exactly two rolls uses the bar at $x=2$.",
    "The player's profit values are $+1$, $0$ and $-1$ after accounting for the $1 game cost and the payout rules.",
    "Calculate $E(Y)=\\sum yP(Y=y)$ for player profit; the charity's long-run profit is the opposite sign."
  ],
  "68": [
    "For $3.16\\times10^{13}$, use $\\log_{10}(3.16\\times10^{13})\\approx13.5$ as the horizontal graph value.",
    "Find the line equation for $M_w$ against $\\log_{10}(M_0)$ by reading two clear points from the graph to get slope and intercept.",
    "For $M_w=4$, solve the linear equation for $\\log_{10}(M_0)$ first, then convert back using $M_0=10^{\\text{that value}}$."
  ],
  "69": [
    "At upright height $10$, solve $10=20-\\frac45x^2$ to get the half-width of the shampoo region.",
    "Volume is $4\\times$ cross-sectional area, so integrate the horizontal width with respect to height, then multiply by 4.",
    "After turning the bottle over, use the parabola $y=\\frac45x^2$, set the new volume equal to part (a), and solve for the level $h$."
  ],
  "70": [
    "Use $A(0)=21$ first: since $\\log_4(1)=0$, this gives the vertical parameter $c$ immediately.",
    "After one week, the total learnt is $21+32=53$, so substitute $t=1$ to determine $b$.",
    "To test whether all 493 algorithms are learnt, set $A(t)=493$ and solve the logarithmic equation for $t$."
  ],
  "71": [
    "For the mean, set up $E(X)=\\int_1^5 x\\,p(x)\\,dx$; it is not simply the midpoint.",
    "The integral involving $x\\ln x$ needs integration by parts: take $u=\\ln x$ and $dv=x\\,dx$.",
    "For the median, solve $\\int_1^M p(x)\\,dx=0.5$ using $\\int\\ln x\\,dx=x\\ln x-x$."
  ],
  "72": [
    "By the Fundamental Theorem of Calculus, $F\'(x)=\\sqrt{x}\\sin x$.",
    "$F(0)=0$ because the integral has the same upper and lower limit when $x=0$.",
    "For $F(2\\pi)$, use the signed areas from the graph: area above the axis is positive and area below the axis is negative."
  ],
  "73": [
    "Rewrite $h(t)=\\sqrt{8t}$ as $(8t)^{1/2}$ before differentiating with the chain rule.",
    "Evaluate $h'(t)$ at $t=8$ for the exact rate of change after eight seconds.",
    "For the increase from $8$ to $8.1$ seconds, use $\\delta h\\approx h'(8)(0.1)$."
  ],
  "74": [
    "The PDF is uniform from $5$ to $8$, so the rectangle width is $3$ and its height must be $k=\\frac13$.",
    "For $P(T>5.5\\mid T<6)$, use interval lengths: numerator is the overlap $(5.5,6)$ and denominator is $(5,6)$.",
    "For three days, success means $7\\le T\\le8$, so $p=\\frac13$; then use the binomial formula for exactly two successes."
  ],
  "75": [
    "Split the shaded area at $x=1$ because the lower boundary changes there.",
    "From $0$ to $1$ the lower boundary is the $x$-axis; from $1$ to $2$ it is $y=3x^2-6x+3$.",
    "Use top minus bottom with top $y=-3x^2+\\dfrac{15}{2}x$, then evaluate the two definite integrals and add them."
  ],
  "76": [
    "Returning to the starting position means the displacement $x$ changes sign or equals zero; look at the displacement row.",
    "Coming to a stop means $v=0$; locate where the velocity sign changes between consecutive times.",
    "Slowing down occurs when velocity and acceleration have opposite signs; use $v$ for increasing/decreasing and $a$ for concavity in the sketch."
  ],
  "77": [
    "For $2\\ln x=\\ln9+4$, divide by 2 first or rewrite $4$ as $\\ln(e^4)$ before exponentiating.",
    "Keep the domain $x>0$ because the original equation contains $\\ln x$.",
    "Use $m=\\log_3 6=\\log_3 2+1$ and $n=\\log_6 5$, so $\\log_3 5=mn$ and $\\log_3 10=\\log_3 2+\\log_3 5$."
  ],
  "78": [
    "Because the balls are drawn without replacement, use a tree diagram or combinations from 2 red and 3 blue for $X=0,1,2$.",
    "The expected payout is $5E(X)$, since the player receives $5 for each red ball drawn.",
    "To make $X$ binomial with maximum 2, the two draws must be independent with constant red probability, such as drawing with replacement."
  ],
  "79": [
    "Use the exact model $m(t)=\\dfrac1{10}e^{t/10-t^2/3000}$ and substitute $t=150$ for the mature mass.",
    "To find when the apple reaches 100 g, multiply by 10, take natural logs, and solve the resulting quadratic equation in $t$.",
    "For maximum growth rate, find $g(t)=m'(t)$, then solve $g'(t)=0$ within $0\\le t\\le150$."
  ],
  "80": [
    "For score probabilities, standardise with $Z=\\dfrac{X-50}{10}$.",
    "For the sample proportion in part (d), first find $p=P(43\\le X\\le57)$, then use the approximate normal distribution of $\\hat p$ with $n=50$.",
    "For the transformed scores, convert the two tail probabilities into z-score equations for the new mean and standard deviation of $Y$."
  ],
  "81": [
    "For part (a), substitute $D=18$ into $s=40.6\\ln(0.15D)$.",
    "When differentiating, $\\dfrac{d}{dD}\\ln(0.15D)=\\dfrac1D$, so $\\dfrac{ds}{dD}=\\dfrac{40.6}{D}$.",
    "Since $\\dfrac{40.6}{D}$ is larger for smaller $D$, compare how an 8 m reduction affects lower-target roads versus higher-target roads."
  ],
  "82": [
    "Point $C$ is on the vertical line $x=4$, so substitute $x=4$ into the dog's path equation.",
    "For the minimum point, differentiate the path equation and solve $\\dfrac{dy}{dx}=0$.",
    "For the ball's position, find the tangent line at the dog's given point and extend that tangent to $x=4$."
  ],
  "83": [
    "For the normal-model judgement, compare the PDF with a symmetric bell shape and note its finite support from $0$ to $\\frac23$.",
    "Six months is $0.5$ years, so the probability is the area under the PDF from $t=0$ to $t=0.5$.",
    "To find the constant $a$, impose total area 1 over $0\\le t\\le\\frac23$, then reuse that $a$ in the probability integral."
  ],
  "84": [
    "From $\\theta(t)=\\dfrac{45}{2}\\sin(300\\pi t)$, the period is $\\dfrac{2\\pi}{300\\pi}$.",
    "The amplitude is $22.5^\\circ$, but the total oscillation angle is from minimum to maximum, so double the amplitude.",
    "Differentiate $\\theta(t)$ and multiply by the given factor for $v(t)$; maximum speed occurs when the cosine factor has magnitude 1."
  ],
  "85": [
    "Returning after two moves requires one forward and one backward move: list $FB$ and $BF$ and add their probabilities.",
    "For 10 moves, net displacement is $5(X-(10-X))$, so translate '20 cm or more forward' into an inequality for $X$.",
    "After 100 moves back at the origin, forward and backward moves must be equal, so use $\\hat p=50/100$ for the confidence interval."
  ],
  "86": [
    "For bias, the sample includes athletes referred by doctors and recorded in a repository, not every athlete with unexplained symptoms.",
    "Calculate $\\hat p=\\frac{25}{71}$, then use the 95% interval formula $\\hat p\\pm1.96\\sqrt{\\hat p(1-\\hat p)/71}$.",
    "For the guaranteed sample size, use $p(1-p)=0.25$ and round up; for the final comparison, check whether $0.20$ lies inside the interval."
  ],
  "87": [
    "To compare 90 dB and 60 dB, subtract the two log equations so the reference intensity cancels and only the intensity ratio remains.",
    "Use the normal conversation fact $60=10\\log_{10}(10^{-6}/I_0)$ to solve for the reference intensity $I_0$.",
    "After finding $I_0$, expand the log quotient to get a straight-line equation in $\\log_{10}(I)$; for $I=10000$, use $\\log_{10}(I)=4$."
  ]
};

function improveWACEBreakdowns() {
  const groups = [
    typeof WACE_EXTRA_QUESTIONS !== 'undefined' ? WACE_EXTRA_QUESTIONS : [],
    typeof WACE_2021_QUESTIONS !== 'undefined' ? WACE_2021_QUESTIONS : [],
    typeof WACE_2020_QUESTIONS !== 'undefined' ? WACE_2020_QUESTIONS : [],
    typeof WACE_2024_QUESTIONS !== 'undefined' ? WACE_2024_QUESTIONS : [],
    typeof WACE_2025_QUESTIONS !== 'undefined' ? WACE_2025_QUESTIONS : []
  ];
  groups.flat().forEach(q => {
    if (WACE_GUIDED_BREAKDOWNS[q.id]) q.breakdown = WACE_GUIDED_BREAKDOWNS[q.id];
    if (typeof WACE_SPECIFIC_HINTS !== 'undefined' && WACE_SPECIFIC_HINTS[q.id]) q.hints = WACE_SPECIFIC_HINTS[q.id];
  });
}

function renderWACEExtraBank() {
  improveWACEBreakdowns();
  const root = document.getElementById('wace-extra-bank');
  if (!root || root.dataset.rendered === 'true') return;
  root.dataset.rendered = 'true';
  let html = '';
  const waceQuestionsToRender = [...WACE_EXTRA_QUESTIONS, ...(typeof WACE_2021_QUESTIONS !== 'undefined' ? WACE_2021_QUESTIONS : []), ...(typeof WACE_2020_QUESTIONS !== 'undefined' ? WACE_2020_QUESTIONS : []), ...(typeof WACE_2024_QUESTIONS !== 'undefined' ? WACE_2024_QUESTIONS : []), ...(typeof WACE_2025_QUESTIONS !== 'undefined' ? WACE_2025_QUESTIONS : [])];
  waceQuestionsToRender.forEach(q => {
    hints[q.id] = q.hints || [];
    hintCounts[q.id] = 0;
    const hintCount = (q.hints || []).length || maxHints;
    const sectionKey = normaliseWACESection(q.section);
    html += `<div class="wace-q-card" data-topic="${q.topics}" data-year="${q.year}" data-section="${sectionKey}">
      <div class="wace-q-meta">
        <span class="wace-year-badge">${q.year}</span>
        <span class="wace-section-badge">${q.section}</span>
        <span class="wace-topic-badge">${q.title.replace(/^Question \d+ — /,'')}</span>
        <span class="wace-marks">${q.marks}</span>
      </div>
      <div class="wace-q-body">
        <div class="wace-q-text"><strong>${q.title}</strong> <span style="color:var(--muted);font-size:12px">(${q.source})</span></div>
        <div style="margin-top:14px">${q.body}</div>
      </div>
      <div class="wace-timer-zone" id="timer-zone-${q.id}">
        <div class="timer-ring-wrap">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <circle class="timer-bg" cx="35" cy="35" r="30"/>
            <circle class="timer-fill" cx="35" cy="35" r="30" id="timer-fill-${q.id}"/>
          </svg>
          <div class="timer-text" id="timer-text-${q.id}">3:00</div>
        </div>
        <div class="timer-info">
          <div class="timer-label">Answer unlocks after 3 minutes</div>
          <div class="timer-status timer-locked" id="timer-status-${q.id}">⏳ Think it through first — no peeking!</div>
        </div>
        <button class="btn btn-secondary" style="font-size:13px;padding:9px 18px" onclick="startTimer(${q.id})" id="start-btn-${q.id}">Start Timer</button>
      </div>
      <div class="wace-action-bar">
        <button class="wace-btn wace-btn-hint" onclick="showHint(${q.id})" id="hint-btn-${q.id}" disabled>
          💡 Hint <span class="hint-count" id="hints-left-${q.id}">${hintCount}</span>
        </button>
        <button class="wace-btn wace-btn-breakdown" onclick="toggleBreakdown(${q.id})">📋 Break it down</button>
        <button class="wace-btn wace-btn-answer" onclick="showWACEAnswer(${q.id})" id="ans-btn-${q.id}" disabled>✓ Show answer</button>
      </div>
      <div class="breakdown-panel" id="breakdown-${q.id}">
        <div class="panel-title violet">STEP-BY-STEP PROCESS</div>
        ${(q.breakdown || []).map(step => `<div class="breakdown-step"><span class="step-arrow">→</span><span>${step}</span></div>`).join('')}
      </div>
      <div class="hint-panel" id="hint-${q.id}">
        <div class="panel-title gold">HINT</div>
        <div id="hint-content-${q.id}">Click hint to reveal</div>
      </div>
      <div class="solution-panel" id="solution-${q.id}">
        <div class="panel-title green">FULL SOLUTION</div>
        <div class="answer-steps">
          ${(q.solutions || []).map(sol => `<div class="answer-step"><span class="step-num">${sol.label}</span><span>${sol.html}</span></div>`).join('')}
        </div>
      </div>
    </div>`;
  });
  root.innerHTML = html;
  if (window.renderMathInElement) {
    renderMathInElement(root, {
      delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]
    });
  }
}


function shuffleWACEBankCards() {
  const layout = document.querySelector('#page-wace .wace-layout');
  if (!layout || layout.dataset.shuffled === 'true') return;
  const cards = Array.from(layout.querySelectorAll('.wace-q-card'));
  if (cards.length <= 1) return;
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach(card => layout.appendChild(card));
  layout.dataset.shuffled = 'true';
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  addSupplementaryPractice();
  enrichAllBanks();
  initModuleBank();
  initDerivativesBank();
  initDRVBank();
  initLogBank();
  initCRVBank();
  initCIBank();
  renderWACEExtraBank();
  annotateWACECards();
  shuffleWACEBankCards();
  annotateWACECards();
  applyWACEFilters();
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('heroCanvas');
    if (canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  });
});
