import{e as L,u as ge,b as me,a as xe,r as i,j as e,X as V,g as Y,Q as u,L as he,h as pe,C as ue,f as be,s as ye}from"./index-29f69ecd.js";import{T as fe}from"./TagManager-d31d9b36.js";import{S as B}from"./shield-32738f18.js";import{A as ve,S as we}from"./star-365948ff.js";import{C as ke}from"./clock-67ccf049.js";import{T as je}from"./tag-6ecaa4e9.js";import"./loader-2-00e010a3.js";import"./palette-fbabb91b.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=L("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=L("Printer",[["polyline",{points:"6 9 6 2 18 2 18 9",key:"1306q4"}],["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["rect",{width:"12",height:"8",x:"6",y:"14",key:"5ipwut"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=L("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]),Fe=({setCurrentView:$,onBack:Ae})=>{const{members:h,currentTable:D,attendanceData:f,availableSundayDates:p,isMonthAttendanceComplete:X,updateMember:E,calculateAttendanceRate:P,isCollaborator:Ie,dataOwnerId:Z,isSupabaseConfigured:Ce}=ge(),{isDarkMode:J}=me(),{user:v,signInWithGoogle:ee}=xe(),[b,k]=i.useState(()=>{if(localStorage.getItem("adminStayLoggedIn")==="true"){const a=localStorage.getItem("adminAuthExpiry");if(a&&new Date().getTime()<parseInt(a))return!0;localStorage.removeItem("adminStayLoggedIn"),localStorage.removeItem("adminAuthExpiry")}return sessionStorage.getItem("adminAuthenticated")==="true"}),[w,j]=i.useState(""),[M,N]=i.useState(!1),[S,z]=i.useState(!1),[A,te]=i.useState(!1),[F,I]=i.useState(Date.now()),ae=15,[q,G]=i.useState(!1),[re,R]=i.useState(!1);i.useEffect(()=>{if(!b)return;const a=setInterval(()=>{if(localStorage.getItem("adminStayLoggedIn")==="true")return;Date.now()-F>ae*60*1e3&&(O(),u.info("Admin session expired due to inactivity"))},6e4);return()=>clearInterval(a)},[b,F]),i.useEffect(()=>{if(!b)return;const t=()=>I(Date.now());return window.addEventListener("mousemove",t),window.addEventListener("keydown",t),window.addEventListener("click",t),()=>{window.removeEventListener("mousemove",t),window.removeEventListener("keydown",t),window.removeEventListener("click",t)}},[b]);const se=async t=>{if(t.preventDefault(),!(!(v!=null&&v.email)||!w)){z(!0),N(!1);try{const{error:a}=await ye.auth.signInWithPassword({email:v.email,password:w});if(a)N(!0),j("");else{if(k(!0),I(Date.now()),A){const c=new Date().getTime()+6048e5;localStorage.setItem("adminStayLoggedIn","true"),localStorage.setItem("adminAuthExpiry",c.toString())}else sessionStorage.setItem("adminAuthenticated","true");u.success("Admin access granted")}}catch{N(!0),j("")}finally{z(!1)}}},O=()=>{k(!1),sessionStorage.removeItem("adminAuthenticated"),localStorage.removeItem("adminStayLoggedIn"),localStorage.removeItem("adminAuthExpiry")},ne=async()=>{G(!0);try{await ee(),sessionStorage.setItem("adminAuthenticated","true"),k(!0),I(Date.now()),u.success("Admin access granted with Google")}catch(t){console.error("Google admin access failed:",t),u.error("Google sign-in failed for admin access")}finally{G(!1)}},[_,C]=i.useState(!1),[y,Q]=i.useState(null),[oe,U]=i.useState(!1),[W,le]=i.useState(!1),de=()=>{const t=(p==null?void 0:p.map(n=>{if(n instanceof Date){const r=n.getFullYear(),s=String(n.getMonth()+1).padStart(2,"0"),d=String(n.getDate()).padStart(2,"0");return`${r}-${s}-${d}`}return n}))||[],a=[...h].sort((n,r)=>{const s=(n.full_name||n["Full Name"]||"").toLowerCase(),d=(r.full_name||r["Full Name"]||"").toLowerCase();return s.localeCompare(d)}),c=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Sheet - ${T}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
          .toolbar { 
            position: fixed; top: 0; left: 0; right: 0; 
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 12px 20px; 
            display: flex; align-items: center; gap: 15px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            flex-wrap: wrap;
          }
          .toolbar label { color: #e2e8f0; font-size: 13px; font-weight: 500; }
          .toolbar select, .toolbar input[type="number"] { 
            padding: 8px 12px; border-radius: 8px; border: 1px solid #475569; 
            font-size: 13px; background: #1e293b; color: white; cursor: pointer;
          }
          .toolbar select:focus { outline: none; border-color: #f97316; }
          .toolbar button {
            padding: 10px 20px; border-radius: 8px; border: none;
            font-weight: 600; cursor: pointer; transition: all 0.2s;
          }
          .btn-print { background: #059669; color: white; }
          .btn-print:hover { background: #047857; transform: translateY(-1px); }
          .btn-close { background: #475569; color: white; margin-left: auto; }
          .btn-close:hover { background: #64748b; }
          .toolbar-group { display: flex; align-items: center; gap: 8px; }
          .toolbar-divider { width: 1px; height: 24px; background: #475569; margin: 0 8px; }
          
          .content { margin-top: 80px; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { text-align: center; margin-bottom: 5px; font-size: 24px; color: #1f2937; }
          h2 { text-align: center; color: #6b7280; font-weight: normal; margin-top: 0; font-size: 16px; }
          
          .editable-title { 
            border: 2px dashed transparent; padding: 5px 10px; border-radius: 4px;
            transition: border-color 0.2s; cursor: text;
          }
          .editable-title:hover { border-color: #f97316; }
          .editable-title:focus { outline: none; border-color: #f97316; background: #fff7ed; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
          th { background: #f3f4f6; font-weight: 600; color: #374151; }
          td:nth-child(2) { text-align: left; }
          .present { background: #d1fae5; color: #065f46; font-weight: bold; }
          .absent { background: #fee2e2; color: #991b1b; font-weight: bold; }
          
          .summary { margin: 20px 0; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
          .summary-item { text-align: center; padding: 15px 25px; background: #f9fafb; border-radius: 8px; }
          .summary-value { font-size: 28px; font-weight: bold; }
          .summary-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
          
          .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 11px; }
          
          @media print {
            body { background: white; padding: 10px; }
            .toolbar { display: none !important; }
            .content { margin-top: 0; box-shadow: none; padding: 0; }
            .editable-title { border: none !important; }
            table { font-size: 10px; }
            th, td { padding: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div class="toolbar-group">
            <label>📝 Font:</label>
            <select id="fontSize" onchange="changeFontSize(this.value)">
              <option value="9">Tiny</option>
              <option value="10">Small</option>
              <option value="12" selected>Normal</option>
              <option value="14">Large</option>
            </select>
          </div>
          <div class="toolbar-divider"></div>
          <div class="toolbar-group">
            <label>📊 Style:</label>
            <select id="tableStyle" onchange="changeTableStyle(this.value)">
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="striped">Striped</option>
              <option value="bordered">Bold Border</option>
            </select>
          </div>
          <div class="toolbar-divider"></div>
          <div class="toolbar-group">
            <label>
              <input type="checkbox" id="showSummary" checked onchange="toggleSummary(this.checked)"> 
              Summary
            </label>
          </div>
          <div class="toolbar-group">
            <label>
              <input type="checkbox" id="boldNames" onchange="toggleBoldNames(this.checked)"> 
              Bold Names
            </label>
          </div>
          <div class="toolbar-group">
            <label>
              <input type="checkbox" id="showGender" checked onchange="toggleColumn('gender', this.checked)"> 
              Gender
            </label>
          </div>
          <div class="toolbar-group">
            <label>
              <input type="checkbox" id="showLevel" checked onchange="toggleColumn('level', this.checked)"> 
              Level
            </label>
          </div>
          <div class="toolbar-divider"></div>
          <button class="btn-print" onclick="window.print()">🖨️ Print</button>
          <button class="btn-close" onclick="window.close()">✕ Close</button>
        </div>
        
        <div class="content">
          <h1 contenteditable="true" class="editable-title">Attendance Sheet</h1>
          <h2 contenteditable="true" class="editable-title">${T}</h2>
          
          <div class="summary" id="summarySection">
            <div class="summary-item">
              <div class="summary-value">${h.length}</div>
              <div class="summary-label">Total Members</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" style="color: #10b981">${l.totalPresent}</div>
              <div class="summary-label">Total Present</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" style="color: #ef4444">${l.totalAbsent}</div>
              <div class="summary-label">Total Absent</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" style="color: #8b5cf6">${l.attendanceRate}%</div>
              <div class="summary-label">Attendance Rate</div>
            </div>
          </div>
          
          <table id="attendanceTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Level</th>
                ${t.map(n=>`<th>${new Date(n).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</th>`).join("")}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${a.map((n,r)=>{let s=0;const d=t.map(g=>{var m;const o=(m=f[g])==null?void 0:m[n.id];return o===!0?(s++,'<td class="present">P</td>'):o===!1?'<td class="absent">A</td>':"<td>-</td>"}).join("");return`<tr>
                  <td>${r+1}</td>
                  <td class="member-name">${n.full_name||n["Full Name"]||"N/A"}</td>
                  <td>${n.Gender||"N/A"}</td>
                  <td>${n["Current Level"]||"N/A"}</td>
                  ${d}
                  <td><strong>${s}/${t.length}</strong></td>
                </tr>`}).join("")}
            </tbody>
          </table>
          
          <p class="footer" contenteditable="true">Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <script>
          function changeFontSize(size) {
            document.getElementById('attendanceTable').style.fontSize = size + 'px';
          }
          function changeTableStyle(style) {
            const table = document.getElementById('attendanceTable');
            // Reset all styles first
            table.querySelectorAll('tbody tr').forEach(row => row.style.background = '');
            table.querySelectorAll('th, td').forEach(cell => {
              cell.style.padding = '';
              cell.style.borderWidth = '';
            });
            
            if (style === 'striped') {
              table.querySelectorAll('tbody tr').forEach((row, i) => {
                row.style.background = i % 2 === 0 ? '#f8fafc' : 'white';
              });
            } else if (style === 'compact') {
              table.querySelectorAll('th, td').forEach(cell => {
                cell.style.padding = '3px 5px';
              });
            } else if (style === 'bordered') {
              table.querySelectorAll('th, td').forEach(cell => {
                cell.style.borderWidth = '2px';
              });
            }
          }
          function toggleSummary(show) {
            document.getElementById('summarySection').style.display = show ? 'flex' : 'none';
          }
          function toggleBoldNames(bold) {
            document.querySelectorAll('.member-name').forEach(cell => {
              cell.style.fontWeight = bold ? 'bold' : 'normal';
            });
          }
          function toggleColumn(col, show) {
            const colIndex = col === 'gender' ? 2 : col === 'level' ? 3 : -1;
            if (colIndex === -1) return;
            document.querySelectorAll('#attendanceTable tr').forEach(row => {
              const cell = row.children[colIndex];
              if (cell) cell.style.display = show ? '' : 'none';
            });
          }
        <\/script>
      </body>
      </html>
    `,x=window.open("","_blank");x.document.write(c),x.document.close()},T=D?D.replace("_"," "):"No Month Selected",l=i.useMemo(()=>{const t=(p==null?void 0:p.map(s=>{if(s instanceof Date){const d=s.getFullYear(),g=String(s.getMonth()+1).padStart(2,"0"),o=String(s.getDate()).padStart(2,"0");return`${d}-${g}-${o}`}return s}))||[];let a=0,c=0;const x=t.map(s=>{const d=f[s]||{},g=Object.values(d).filter(m=>m===!0).length,o=Object.values(d).filter(m=>m===!1).length;return a+=g,c+=o,{date:s,present:g,absent:o,total:g+o,marked:g+o>0}}),n=h.length*t.length,r=n>0?Math.round(a/n*100):0;return{totalMembers:h.length,totalPresent:a,totalAbsent:c,attendanceRate:r,sundayStats:x,sundaysCompleted:x.filter(s=>s.marked).length,totalSundays:t.length}},[h,f,p]),H=i.useMemo(()=>h.map(t=>{const a=P(t);return{id:t.id,name:t.full_name||t["Full Name"]||"Unknown",rate:a,badge:t["Badge Type"]||"newcomer"}}).filter(t=>t.rate>0).sort((t,a)=>a.rate-t.rate).slice(0,5),[h,P]),ie=async()=>{var t;C(!0),Q(null);try{if(!X()){u.error("Please complete attendance for all Sundays first."),C(!1);return}const c={qualified:[],notQualified:[],totalProcessed:0},x=[...p||[]].sort((r,s)=>{const d=r instanceof Date?r:new Date(r),g=s instanceof Date?s:new Date(s);return d-g});for(const r of h){c.totalProcessed++;let s=0,d=0,g=!1;for(const m of x){const ce=m instanceof Date?`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`:m;((t=f[ce])==null?void 0:t[r.id])===!0?(s++,d++,d>=3&&(g=!0)):d=0}const o={id:r.id,name:r.full_name||r["Full Name"],presentCount:s,currentBadge:r["Badge Type"]||"newcomer"};g?(r["Badge Type"]!=="regular"&&(await E(r.id,{"Badge Type":"regular"},{silent:!0}),o.newBadge="regular",o.upgraded=!0),c.qualified.push(o)):s>=2?(r["Badge Type"]!=="member"&&r["Badge Type"]!=="regular"&&(await E(r.id,{"Badge Type":"member"},{silent:!0}),o.newBadge="member",o.upgraded=!0),c.qualified.push(o)):c.notQualified.push(o)}Q(c),U(!0);const n=c.qualified.filter(r=>r.upgraded).length;u.success(`Badge processing complete! ${n} members upgraded.`)}catch(a){console.error("Error processing badges:",a),u.error("Failed to process badges. Please try again.")}finally{C(!1)}};return b?e.jsxs("div",{className:"min-h-screen pb-24",children:[e.jsx("div",{className:"sticky top-0 z-20 w-full py-3",children:e.jsx("div",{className:"max-w-4xl mx-auto px-4 relative",children:e.jsxs("div",{className:"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-3 sm:gap-4 flex-1 min-w-0",children:[e.jsx("div",{className:"bg-slate-100 dark:bg-slate-700/50 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 flex-shrink-0",children:e.jsx(B,{className:"w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300"})}),e.jsxs("div",{className:"min-w-0 overflow-hidden",children:[e.jsx("h1",{className:"text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight truncate",children:"Admin Panel"}),e.jsx("p",{className:"text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate",children:T})]})]}),e.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2",children:[e.jsxs("button",{onClick:()=>{O(),u.info("Admin session ended")},className:"flex items-center gap-2 px-2.5 py-2 sm:px-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group",title:"Lock Admin Panel",children:[e.jsx(he,{className:"w-4 h-4 transition-transform group-hover:translate-x-0.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Lock"})]}),e.jsx("div",{className:"h-6 sm:h-8 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1"}),e.jsxs("button",{onClick:()=>$("dashboard"),className:"flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",title:"Back to Dashboard",children:[e.jsx(pe,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Back to Dashboard"}),e.jsx("span",{className:"sm:hidden",children:"Back"})]}),e.jsxs("button",{onClick:()=>R(t=>!t),className:"flex items-center gap-2 px-3 py-2 sm:px-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",title:"Overview",children:[e.jsx(Ne,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Overview"})]})]}),re&&e.jsx("div",{className:"absolute right-4 top-full mt-2 w-80 z-50",children:e.jsxs("div",{className:"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-3",children:[e.jsxs("div",{className:"flex items-start justify-between mb-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:"Overview"}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Quick summary"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:de,className:"px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200",children:"Print"}),e.jsx("button",{onClick:()=>R(!1),className:"px-2 py-1 text-sm rounded-lg text-gray-500 hover:text-gray-700",children:"Close"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{className:"p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700",children:[e.jsx("p",{className:"text-xl font-bold text-gray-900 dark:text-white",children:l.totalMembers}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Total Members"})]}),e.jsxs("div",{className:"p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700",children:[e.jsx("p",{className:"text-xl font-bold text-green-600 dark:text-green-400",children:l.totalPresent}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Total Present"})]}),e.jsxs("div",{className:"p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700",children:[e.jsx("p",{className:"text-xl font-bold text-red-600 dark:text-red-400",children:l.totalAbsent}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Total Absent"})]}),e.jsxs("div",{className:"p-3 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700",children:[e.jsxs("p",{className:"text-xl font-bold text-purple-600 dark:text-purple-400",children:[l.attendanceRate,"%"]}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Attendance Rate"})]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsxs("button",{onClick:()=>le(t=>!t),className:"w-full p-3 flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(ve,{className:"w-4 h-4 text-gray-600 dark:text-gray-400"}),e.jsxs("div",{className:"text-left",children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:"Advanced Features"}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Badge processing & automation"})]})]}),e.jsx(ue,{className:`w-4 h-4 text-gray-400 transition-transform ${W?"rotate-180":""}`})]}),W&&e.jsxs("div",{className:"mt-3 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl p-3 text-white",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-bold",children:"Badge Processing"}),e.jsx("p",{className:"text-xs text-white/80",children:"Auto-assign badges based on attendance"})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("div",{className:"text-sm font-bold",children:[l.sundaysCompleted,"/",l.totalSundays]}),e.jsx("p",{className:"text-xs opacity-80",children:"Sundays"})]})]}),e.jsx("button",{onClick:ie,disabled:_||l.sundaysCompleted<l.totalSundays,className:`w-full mt-3 py-2 rounded-lg font-semibold text-sm ${l.sundaysCompleted<l.totalSundays?"bg-white/20 text-white/50 cursor-not-allowed":"bg-white text-orange-600"}`,children:_?"Processing...":l.sundaysCompleted<l.totalSundays?"Complete Sundays":"Process Badges"})]})]})]})})]})})}),e.jsxs("div",{className:"max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6",children:[y&&oe&&e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up",children:[e.jsxs("div",{className:"p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between",children:[e.jsxs("h3",{className:"font-semibold text-gray-900 dark:text-white flex items-center gap-2",children:[e.jsx(Se,{className:"w-5 h-5 text-yellow-500"}),"Badge Results"]}),e.jsx("button",{onClick:()=>U(!1),className:"p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",children:e.jsx(V,{className:"w-5 h-5 text-gray-400"})})]}),e.jsxs("div",{className:"p-4 space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",children:[e.jsxs("div",{className:"bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center",children:[e.jsx("p",{className:"text-2xl font-bold text-green-600 dark:text-green-400",children:y.qualified.length}),e.jsx("p",{className:"text-sm text-green-600/70 dark:text-green-400/70",children:"Qualified"})]}),e.jsxs("div",{className:"bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center",children:[e.jsx("p",{className:"text-2xl font-bold text-gray-600 dark:text-gray-300",children:y.notQualified.length}),e.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Not Qualified"})]})]}),y.qualified.filter(t=>t.upgraded).length>0&&e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Recently Upgraded:"}),y.qualified.filter(t=>t.upgraded).slice(0,5).map(t=>e.jsxs("div",{className:"flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2",children:[e.jsx("span",{className:"text-sm text-gray-900 dark:text-white",children:t.name}),e.jsx("span",{className:`text-xs px-2 py-1 rounded-full font-medium ${t.newBadge==="regular"?"bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300":"bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300"}`,children:t.newBadge==="regular"?"⭐ Regular":"👤 Member"})]},t.id))]})]})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up",style:{animationDelay:"200ms"},children:[e.jsx("div",{className:"p-4 border-b border-gray-200 dark:border-gray-700",children:e.jsxs("h3",{className:"font-semibold text-gray-900 dark:text-white flex items-center gap-2",children:[e.jsx(be,{className:"w-5 h-5 text-orange-500"}),"This Month's Sundays"]})}),e.jsx("div",{className:"p-4",children:e.jsx("div",{className:"space-y-2",children:l.sundayStats.map((t,a)=>{const x=new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric"});return e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${t.marked?"bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400":"bg-gray-100 dark:bg-gray-700 text-gray-400"}`,children:t.marked?e.jsx(Y,{className:"w-4 h-4"}):a+1}),e.jsx("span",{className:`font-medium ${t.marked?"text-gray-900 dark:text-white":"text-gray-400"}`,children:x})]}),t.marked?e.jsxs("div",{className:"flex items-center gap-4 text-sm",children:[e.jsxs("span",{className:"text-green-600 dark:text-green-400",children:[t.present," present"]}),e.jsxs("span",{className:"text-red-500",children:[t.absent," absent"]})]}):e.jsxs("span",{className:"text-xs text-gray-400 flex items-center gap-1",children:[e.jsx(ke,{className:"w-3 h-3"}),"Not marked"]})]},t.date)})})})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up",style:{animationDelay:"350ms"},children:[e.jsx("div",{className:"p-4 border-b border-gray-200 dark:border-gray-700",children:e.jsxs("h3",{className:"font-semibold text-gray-900 dark:text-white flex items-center gap-2",children:[e.jsx(je,{className:"w-5 h-5 text-primary-600"}),"Tag Management"]})}),e.jsx("div",{className:"p-4",children:e.jsx(fe,{ownerId:Z,isDarkMode:J,onTagsChange:()=>{}})})]}),e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up",style:{animationDelay:"400ms"},children:[e.jsx("div",{className:"p-4 border-b border-gray-200 dark:border-gray-700",children:e.jsxs("h3",{className:"font-semibold text-gray-900 dark:text-white flex items-center gap-2",children:[e.jsx(we,{className:"w-5 h-5 text-yellow-500"}),"Top Attendees"]})}),e.jsx("div",{className:"p-4",children:H.length===0?e.jsx("p",{className:"text-center text-gray-400 py-4",children:"No attendance data yet"}):e.jsx("div",{className:"space-y-2",children:H.map((t,a)=>e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${a===0?"bg-yellow-500":a===1?"bg-gray-400":a===2?"bg-amber-600":"bg-orange-500"}`,children:a+1}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:t.name}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 capitalize",children:t.badge})]})]}),e.jsxs("div",{className:`text-lg font-bold ${t.rate>=90?"text-green-500":t.rate>=75?"text-orange-500":"text-yellow-500"}`,children:[t.rate,"%"]})]},t.id))})})]})]})]}):e.jsx("div",{className:"min-h-screen flex items-center justify-center p-3 sm:p-4",children:e.jsx("div",{className:"w-full max-w-2xl",children:e.jsxs("div",{className:"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden",children:[e.jsxs("div",{className:"bg-gradient-to-br from-orange-600 to-orange-800 dark:from-orange-700 dark:to-orange-900 px-4 sm:px-6 py-6 sm:py-8 text-center",children:[e.jsx("div",{className:"w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/20",children:e.jsx(B,{className:"w-6 h-6 sm:w-8 sm:h-8 text-white"})}),e.jsx("h1",{className:"text-xl sm:text-2xl font-bold text-white",children:"Admin Panel"}),e.jsx("p",{className:"text-orange-100 text-xs sm:text-sm mt-1",children:"Secure Access Required"})]}),e.jsxs("form",{onSubmit:se,className:"p-4 sm:p-6 space-y-4 sm:space-y-5",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Account Password"}),e.jsx("input",{type:"password",value:w,onChange:t=>j(t.target.value),placeholder:"Enter your account password",className:`w-full px-4 py-3 rounded-xl border ${M?"border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20":"border-gray-200 dark:border-gray-600 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700"} text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`,autoFocus:!0,disabled:S}),M&&e.jsxs("p",{className:"mt-2 text-sm text-red-500 flex items-center gap-1",children:[e.jsx(V,{className:"w-4 h-4"}),"Incorrect password. Please try again."]})]}),e.jsxs("label",{className:"flex items-center gap-3 cursor-pointer group",children:[e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"checkbox",checked:A,onChange:t=>te(t.target.checked),className:"sr-only peer"}),e.jsx("div",{className:"w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:border-orange-600 peer-checked:bg-orange-600 transition-all flex items-center justify-center",children:A&&e.jsx(Y,{className:"w-3 h-3 text-white"})})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-sm font-medium text-gray-700 dark:text-gray-300",children:"Stay logged in"}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Keep admin access for 7 days"})]})]}),e.jsx("button",{type:"submit",disabled:S||!w,className:"w-full py-3 bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 disabled:from-orange-300 disabled:to-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2",children:S?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),"Verifying..."]}):e.jsxs(e.Fragment,{children:[e.jsx(B,{className:"w-4 h-4"}),"Access Admin Panel"]})}),e.jsxs("div",{className:"bg-orange-50/70 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/60 rounded-xl p-4 space-y-3",children:[e.jsxs("p",{className:"text-sm text-orange-700 dark:text-orange-200 flex items-start gap-2",children:[e.jsx(K,{className:"w-4 h-4 mt-0.5 flex-shrink-0"}),e.jsx("span",{children:"One-tap Google SSO. We’ll verify your Google profile and unlock admin after the redirect."})]}),e.jsx("button",{type:"button",onClick:ne,disabled:q,className:"w-full py-3 border border-orange-200 dark:border-orange-700 bg-white dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 font-semibold rounded-xl transition-all shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/40 disabled:opacity-70 flex items-center justify-center gap-2",children:q?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"}),"Connecting with Google..."]}):e.jsxs(e.Fragment,{children:[e.jsx(K,{className:"w-4 h-4"}),"Continue with Google"]})})]}),e.jsx("button",{type:"button",onClick:()=>$("dashboard"),className:"w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors",children:"← Back to Dashboard"})]})]})})})};export{Fe as default};
