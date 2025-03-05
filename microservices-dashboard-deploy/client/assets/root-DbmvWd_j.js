import{w as c}from"./with-props-GPLnpKcb.js";import{r as n,j as e,M as d,L as m,O as h,S as u,d as g}from"./chunk-HA7DTUK3-BY0tfoDu.js";const p="/assets/tailwind-BqJoh03_.css",x=`
  let isDark;
  const stored = localStorage.getItem('theme');
  
  if (stored) {
    isDark = stored === 'dark';
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
`,f=()=>[{rel:"stylesheet",href:p}],v=c(function(){const[s,r]=n.useState(()=>!1);n.useEffect(()=>{const t=window.matchMedia("(prefers-color-scheme: dark)"),i=localStorage.getItem("theme");r(document.documentElement.classList.contains("dark"));const a=o=>{i||(r(o.matches),document.documentElement.classList.toggle("dark",o.matches))};return t.addEventListener("change",a),()=>t.removeEventListener("change",a)},[]);const l=()=>{const t=!s;document.documentElement.classList.toggle("dark",t),localStorage.setItem("theme",t?"dark":"light"),r(t)};return e.jsxs("html",{lang:"en",className:s?"dark":"",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),e.jsx(d,{}),e.jsx(m,{}),e.jsx("script",{dangerouslySetInnerHTML:{__html:x}})]}),e.jsxs("body",{className:"bg-gray-50 dark:bg-gray-900 min-h-screen",children:[e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("header",{className:"mb-8 flex justify-between items-center",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900 dark:text-white",children:"Dashboard Services"}),e.jsxs("button",{onClick:l,className:`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                text-gray-900 dark:text-white
                hover:bg-gray-200 dark:hover:bg-gray-700
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                transition-all duration-500 ease-out
                group relative flex items-center justify-center w-10 h-10`,"aria-label":s?"Switch to light mode":"Switch to dark mode",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:`w-5 h-5 absolute transition-all duration-500
                  ${s?"rotate-90 opacity-0 scale-50":"rotate-0 opacity-100 scale-100"}`,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"})}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:`w-5 h-5 absolute transition-all duration-500
                  ${s?"rotate-0 opacity-100 scale-100":"-rotate-90 opacity-0 scale-50"}`,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"})}),e.jsx("div",{className:"absolute inset-0 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700"}),e.jsx("div",{className:`absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-500/0 to-purple-500/0 
                  group-hover:from-purple-500/5 group-hover:to-purple-500/10 
                  dark:group-hover:from-purple-400/5 dark:group-hover:to-purple-400/10 
                  transition-all duration-500`})]})]}),e.jsx("main",{children:e.jsx(h,{})})]}),e.jsx(u,{}),e.jsx(g,{})]})]})});export{v as default,f as links};
