import{c as N,r as s,j as t,af as C}from"./index-CLTl5StW.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=N("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),$=({label:b,placeholder:y="Select an option...",options:i,value:l,onChange:p,error:u,disabled:x=!1,className:k="",showSearch:n=!1,position:v="bottom-left"})=>{const[r,d]=s.useState(!1),[c,o]=s.useState(""),f=s.useRef(null),m=s.useRef(null),a=i.find(e=>e.value===l),h=n&&c?i.filter(e=>e.label.toLowerCase().includes(c.toLowerCase())||e.description?.toLowerCase().includes(c.toLowerCase())):i;s.useEffect(()=>{const e=g=>{f.current&&!f.current.contains(g.target)&&(d(!1),o(""))};return r&&document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[r]),s.useEffect(()=>{const e=g=>{g.key==="Escape"&&(d(!1),o(""))};return r&&document.addEventListener("keydown",e),()=>{document.removeEventListener("keydown",e)}},[r]),s.useEffect(()=>{r&&n&&m.current&&m.current.focus()},[r,n]);const w=e=>{p(e),d(!1),o("")},j=()=>{switch(v){case"bottom-left":return"left-0 top-full mt-2";case"bottom-right":return"right-0 top-full mt-2";case"top-left":return"left-0 bottom-full mb-2";case"top-right":return"right-0 bottom-full mb-2";default:return"left-0 top-full mt-2"}};return t.jsxs("div",{className:`space-y-1 ${k}`,children:[b&&t.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:b}),t.jsxs("div",{className:"relative",ref:f,children:[t.jsxs("button",{type:"button",onClick:()=>!x&&d(!r),disabled:x,className:`
            w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
            bg-white dark:bg-gray-700 text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 flex items-center justify-between
            ${x?"opacity-50 cursor-not-allowed":"cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"}
            ${u?"border-red-300 focus:ring-red-500 focus:border-red-500":""}
            ${r?"ring-2 ring-blue-500 border-blue-500":""}
          `,children:[t.jsxs("div",{className:"flex items-center space-x-3 flex-1 min-w-0",children:[a?.icon&&t.jsx("div",{className:"flex-shrink-0 text-gray-400",children:a.icon}),t.jsx("div",{className:"flex-1 min-w-0",children:a?t.jsxs("div",{children:[t.jsx("div",{className:"text-sm font-medium text-gray-900 dark:text-white truncate",children:a.label}),a.description&&t.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400 truncate",children:a.description})]}):t.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:y})})]}),t.jsx(C,{className:`w-4 h-4 text-gray-400 transition-transform duration-200 ${r?"rotate-180":""}`})]}),r&&t.jsxs("div",{className:`
            absolute ${j()} w-full min-w-full max-w-sm
            bg-white dark:bg-gray-800 
            rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
            z-[60] py-1 max-h-64 overflow-y-auto
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200
          `,children:[n&&t.jsx("div",{className:"p-2 border-b border-gray-200 dark:border-gray-600",children:t.jsx("input",{ref:m,type:"text",placeholder:"Search options...",value:c,onChange:e=>o(e.target.value),className:`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded \r
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white\r
                            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`})}),t.jsx("div",{className:"py-1",children:h.length===0?t.jsx("div",{className:"px-3 py-2 text-sm text-gray-500 dark:text-gray-400",children:"No options found"}):h.map(e=>t.jsxs("button",{type:"button",onClick:()=>w(e.value),className:`
                      w-full flex items-center px-3 py-2 text-sm transition-all duration-150 
                      text-left hover:bg-gray-100 dark:hover:bg-gray-700
                      ${l===e.value?"bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400":"text-gray-700 dark:text-gray-300"}
                    `,children:[t.jsxs("div",{className:"flex items-center space-x-3 flex-1 min-w-0",children:[e.icon&&t.jsx("div",{className:"flex-shrink-0 text-gray-400",children:e.icon}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("div",{className:`font-medium truncate ${l===e.value?"text-blue-600 dark:text-blue-400":"text-gray-900 dark:text-white"}`,children:e.label}),e.description&&t.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400 truncate",children:e.description})]})]}),l===e.value&&t.jsx(E,{className:"w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"})]},e.value))})]})]}),u&&t.jsx("p",{className:"text-sm text-red-600 dark:text-red-400",children:u})]})};export{E as C,$ as D};
