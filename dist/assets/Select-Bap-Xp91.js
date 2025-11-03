import{j as r}from"./index-CLTl5StW.js";const m=({label:a,error:e,options:t,className:o="",id:c,...l})=>{const d=c||`select-${Math.random().toString(36).substr(2,9)}`;return r.jsxs("div",{className:"space-y-1",children:[a&&r.jsx("label",{htmlFor:d,className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:a}),r.jsx("select",{id:d,className:`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
          dark:focus:ring-primary-400 dark:focus:border-primary-400
          ${e?"border-red-300 focus:ring-red-500 focus:border-red-500":""}
          ${o}
        `,...l,children:t.map(s=>r.jsx("option",{value:s.value,children:s.label},s.value))}),e&&r.jsx("p",{className:"text-sm text-red-600 dark:text-red-400",children:e})]})};export{m as S};
