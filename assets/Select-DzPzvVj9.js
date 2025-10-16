import{c as i,j as e}from"./index-wzYYnU-P.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=i("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]),m=({label:s,error:r,options:d,className:c="",id:o,...l})=>{const t=o||`select-${Math.random().toString(36).substr(2,9)}`;return e.jsxs("div",{className:"space-y-1",children:[s&&e.jsx("label",{htmlFor:t,className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:s}),e.jsx("select",{id:t,className:`
          w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
          dark:focus:ring-primary-400 dark:focus:border-primary-400
          ${r?"border-red-300 focus:ring-red-500 focus:border-red-500":""}
          ${c}
        `,...l,children:d.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))}),r&&e.jsx("p",{className:"text-sm text-red-600 dark:text-red-400",children:r})]})};export{u as R,m as S};
