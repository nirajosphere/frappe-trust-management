// import React from "react";

// const FieldCell = ({ label, children }) => {
//   return (
//     <div className="group/cell p-3 rounded-r-lg border-l-2 border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50/50 transition-all duration-200">
//       <span className="block text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1">
//         {label}
//       </span>
//       <div className="min-h-[20px] text-[13px] font-semibold text-zinc-800">{children}</div>
//     </div>
//   );
// };

// export default FieldCell;


import React from "react";

const FieldCell = ({ label, children }) => {
  return (
    <div className="group/cell px-3 py-2 first:pt-3 last:pb-3 rounded-r-lg border-l-2 border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50/50 transition-all duration-200 overflow-hidden">
      <span className="block text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-0.5">
        {label}
      </span>
      <div className="min-h-[20px] text-[13px] font-semibold text-zinc-800 break-words overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FieldCell;