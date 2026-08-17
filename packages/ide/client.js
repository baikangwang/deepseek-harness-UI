/**
 * DSH Code — Client 展示层（pkg-14）。
 *
 * 注册 `sidebar.workspaces`（priority:-1，活动栏 + 四视图）与 `conversation.view`
 * 一级「编辑器」标签页（order:20）。文档/diff 打开时先加入中心编辑器 docStore，
 * 再通过 `ctx.conversation.setView('editor')` 自动切换到编辑器标签（特性探测，
 * 无 setView 时回退为侧栏内联预览）。
 *
 * - 资源管理器：目录树、新建/重命名/删除、在资源管理器中显示、粘贴、树内拖拽、语法高亮预览。
 * - 搜索：ripgrep + 递归回退。
 * - 源码管理：stage/unstage（逐文件+全部）、丢弃、提交、diff。
 * - 会话管理：分组/平铺、搜索、派生、归档、工作区重命名/删除、原生 StateDot 状态点。
 * - 编辑器：一级标签页，内部多文档/diff tab（顶部 tab 条 + 底部内容，占满中栏宽度）。
 */
export default {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const el = React.createElement
    const P = (d) => ({ d, fill: 'currentColor' })
    const ICONS = {
      explorer: { vb: '0 0 16 16', p: [['path', P('M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z')]] },
      search: { vb: '0 0 16 16', p: [['path', P('M11.894845 6.647401C11.894845 3.725463 9.534486 1.356779 6.623219 1.35657C3.711786 1.35657 1.351635 3.725338 1.351635 6.647401C1.351843 9.569296 3.711911 11.938273 6.623219 11.938273C9.534361 11.938064 11.894637 9.569171 11.894845 6.647401ZM13.245462 6.647401C13.245254 10.317935 10.280401 13.293613 6.623219 13.293821C2.965871 13.293821 0.000204 10.31806 0 6.647401C0 2.976574 2.965746 0 6.623219 0C10.280526 0.000205 13.245462 2.9767 13.245462 6.647401Z')], ['path', P('M16.000417 15.041079L15.044449 16.000433L11.530434 12.473588L12.486298 11.514234L16.000417 15.041079Z')]] },
      scm: { vb: '0 0 16 16', p: [['path', { fillRule: 'evenodd', clipRule: 'evenodd', fill: 'currentColor', d: 'M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z' }]] },
      chat: { vb: '0 0 16 16', p: [['path', P('M8.00003 0.3237C3.76075 0.3237 0.32373 3.76072 0.32373 8C0.32373 9.17603 0.589121 10.2922 1.0632 11.2901L1.35291 11.8989L2.5705 11.3205L2.28079 10.7117C1.89079 9.89074 1.67301 8.97167 1.67301 8C1.67301 4.50546 4.50549 1.67298 8.00003 1.67298C11.4946 1.67298 14.3271 4.50546 14.3271 8C14.3271 11.4945 11.4946 14.327 8.00003 14.327C7.28473 14.327 6.76077 14.277 6.29621 14.1487C5.83857 14.0224 5.40441 13.8109 4.88514 13.4488C4.12569 12.919 3.03778 12.7316 2.141 13.2978L2.12682 13.307L2.11264 13.3171L1.34886 13.854L1.79659 15.188L2.86122 14.4384C3.19068 14.2305 3.68325 14.2542 4.11326 14.5539C4.72789 14.9826 5.30042 15.2724 5.93762 15.4484C6.56803 15.6224 7.22776 15.6763 8.00003 15.6763C12.2393 15.6763 15.6763 12.2393 15.6763 8C15.6763 3.76072 12.2393 0.3237 8.00003 0.3237ZM7.32033 4.82535V7.32536H4.82538V8.67464H7.32033V11.1747H8.6696V8.67464H11.1747V7.32536H8.6696V4.82535H7.32033Z')]] },
      folder: { vb: '0 0 16 16', p: [['path', { transform: 'translate(1.5 2.429)', fill: 'currentColor', d: 'M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z' }]] },
      file: { vb: '0 0 16 16', p: [['path', { fillRule: 'evenodd', clipRule: 'evenodd', fill: 'currentColor', d: 'M12.3368 1.53569L11.931 4.43172H14.8086V5.79673H11.7404L11.1962 9.67859H14.2839V11.0436H11.0056L10.4994 14.6529L9.14873 14.4643L9.62731 11.0436H5.75876L5.25252 14.6529L3.90186 14.4643L4.38043 11.0436H1.69141V9.67859H4.57104L5.11417 5.79673H2.21609V4.43172H5.30581L5.73724 1.34713L7.08995 1.53569L6.68414 4.43172H10.5527L10.9841 1.34713L12.3368 1.53569ZM5.94937 9.67859H9.81791L10.361 5.79673H6.49353L5.94937 9.67859Z' }]] },
      plus: { vb: '0 0 16 16', p: [['path', P('M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z')]] },
      minus: { vb: '0 0 16 16', p: [['path', P('M3.5 7.35H12.5V8.65H3.5Z')]] },
      check: { vb: '0 0 16 16', p: [['path', P('M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z')]] },
      edit: { vb: '0 0 16 16', p: [['path', P('M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z')]] },
      trash: { vb: '0 0 16 16', p: [['path', P('M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z')]] },
      refresh: { vb: '0 0 16 16', p: [['path', P('M7.92136 0.349152C10.3744 0.349234 12.5564 1.5052 13.9557 3.29894L15.1281 2.12759C15.3303 1.92546 15.6767 2.06943 15.6767 2.35538V5.53923C15.6766 5.71626 15.5329 5.85976 15.3559 5.86002H12.171C11.8854 5.8597 11.7426 5.51465 11.9443 5.31249L12.9641 4.29056C11.8237 2.74305 9.98908 1.74106 7.92136 1.74097C4.46436 1.74097 1.66233 4.543 1.66233 8C1.66233 11.457 4.46436 14.259 7.92136 14.259C11.3782 14.2589 14.1804 11.4569 14.1804 8H15.5722C15.5722 12.2251 12.1465 15.6507 7.92136 15.6508C3.69614 15.6508 0.270508 12.2252 0.270508 8C0.270508 3.77478 3.69614 0.349152 7.92136 0.349152Z')]] },
      close: { vb: '0 0 16 16', p: [['path', P('M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z')], ['path', P('M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z')]] },
      chevron: { vb: '0 0 14 14', p: [['path', P('M4.25 2.82782L4.25 11.1722C4.25 11.6622 4.84243 11.9076 5.18891 11.5611L9.36109 7.38891C9.57588 7.17412 9.57588 6.82588 9.36109 6.61109L5.18891 2.43891C4.84243 2.09243 4.25 2.33782 4.25 2.82782Z')]] },
      back: { vb: '0 0 14 14', p: [['path', P('M8.5 2.15137L8.07617 2.57617L5.34863 5.30273C5.09294 5.55843 4.86618 5.78438 4.70215 5.98828C4.53117 6.20088 4.38244 6.44405 4.33398 6.75C4.30778 6.91565 4.30778 7.08435 4.33398 7.25C4.38244 7.55595 4.53117 7.79912 4.70215 8.01172C4.86618 8.21561 5.09294 8.44157 5.34863 8.69727L8.07617 11.4238L8.5 11.8486L9.34863 11L8.92383 10.5762L6.19727 7.84863C5.92268 7.57405 5.75151 7.40124 5.6377 7.25977C5.53096 7.12709 5.52187 7.07728 5.51953 7.0625C5.51297 7.02105 5.51297 6.97895 5.51953 6.9375C5.52187 6.92272 5.53096 6.87291 5.6377 6.74023C5.75152 6.59876 5.92268 6.42595 6.19727 6.15137L8.92383 3.42383L9.34863 3L8.5 2.15137Z')]] },
      locate: { vb: '0 0 16 16', p: [['circle', { cx: 8, cy: 8, r: 5, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }], ['path', { d: 'M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }]] },
    }
    function Icon(props) { const def = ICONS[props.name]; if (!def) return null; return el('svg', { viewBox: def.vb, width: props.size || 16, height: props.size || 16, className: props.className, 'aria-hidden': true, fill: 'none', style: Object.assign({ display: 'block', flex: 'none' }, props.style || {}) }, def.p.map(function (s, i) { return el(s[0], Object.assign({ key: i }, s[1])) })) }

    const MATRIX_CELLS = [[0, 0], [4, 0], [8, 0], [8, 4], [8, 8], [4, 8], [0, 8], [0, 4]]
    function StateDot(props) { const state = props.state || 'idle'; const size = props.size || 10; if (state === 'ongoing') return el('svg', { className: 'dshide-dot-matrix', width: size, height: size, viewBox: '0 0 10 10', shapeRendering: 'crispEdges', 'aria-hidden': true }, MATRIX_CELLS.map(function (c, i) { return el('rect', { key: c[0] + '-' + c[1], className: 'dshide-dot-cell', x: c[0], y: c[1], width: 2, height: 2, style: { animationDelay: ((i - 8) * 125) + 'ms' } }) })); return el('span', { className: 'dshide-dot dshide-dot-' + state, style: { width: size, height: size }, 'aria-hidden': true }) }

    function relTime(ts) { if (!ts) return ''; const diff = Date.now() - ts; const m = 60000, h = 3600000, d = 86400000; if (diff < m) return '刚刚'; if (diff < h) return Math.floor(diff / m) + ' 分钟前'; if (diff < d) return Math.floor(diff / h) + ' 小时前'; if (diff < 30 * d) return Math.floor(diff / d) + ' 天前'; return new Date(ts).toLocaleDateString() }
    function joinPath(dir, name) { return dir.replace(/[\\/]+$/, '') + '\\' + name }
    function dirnameOf(p) { const i = Math.max(p.lastIndexOf('\\'), p.lastIndexOf('/')); return i < 0 ? p : p.slice(0, i) }
    function baseName(p) { const s = p.replace(/[\\/]+$/, ''); const i = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/')); return i < 0 ? s : s.slice(i + 1) }
    function detectLang(path) { const p = (path || '').toLowerCase(); if (/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(p)) return 'js'; if (/\.json$/.test(p)) return 'json'; if (/\.(md|markdown)$/.test(p)) return 'md'; if (/\.(css|scss|less)$/.test(p)) return 'css'; if (/\.(html|htm|vue)$/.test(p)) return 'html'; if (/\.py$/.test(p)) return 'py'; if (/\.(sh|bash|zsh)$/.test(p)) return 'sh'; if (/\.ya?ml$/.test(p)) return 'yaml'; return 'text' }
    const KW = { js: 'const let var function return if else for while do class extends super import export from default new try catch finally throw async await typeof instanceof in of this delete void yield switch case break continue', py: 'def return if elif else for while import from class try except finally raise with as lambda pass break continue global not and or in is del yield async await', sh: 'if then else elif fi for while do done case esac function export local return echo cd source' }
    function buildRules(lang) { if (lang === 'text') return []; if (lang === 'md') return [[/^#{1,6}[^\n]*/g, 'tok-md-heading'], [/`[^`\n]*`/g, 'tok-str'], [/\*\*[^*\n]+\*\*/g, 'tok-bold'], [/\[[^\]]*\]\([^)]*\)/g, 'tok-link'], [/^>\s?[^\n]*/g, 'tok-com']]; if (lang === 'json') return [[/"(?:[^"\\]|\\.)*"(?=\s*:)/g, 'tok-json-key'], [/"(?:[^"\\]|\\.)*"/g, 'tok-str'], [/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, 'tok-num'], [/\b(?:true|false|null)\b/g, 'tok-bool']]; if (lang === 'html') return [[/<!--[\s\S]*?-->/g, 'tok-com'], [/<\/?[a-zA-Z][a-zA-Z0-9-]*/g, 'tok-tag'], [/\/?>/g, 'tok-tag'], [/[a-zA-Z-]+(?==")/g, 'tok-attr'], [/"[^"]*"/g, 'tok-str']]; if (lang === 'css') return [[/\/\*[\s\S]*?\*\//g, 'tok-com'], [/[a-zA-Z-]+(?=\s*:)/g, 'tok-prop'], [/#[0-9a-fA-F]{3,8}\b/g, 'tok-num'], [/-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|fr)?\b/gi, 'tok-num'], [/"[^"]*"|'[^']*'/g, 'tok-str']]; const kws = (KW[lang] || KW.js).split(' ').join('|'); const lineComment = (lang === 'py' || lang === 'sh' || lang === 'yaml') ? /#[^\n]*/g : /\/\/[^\n]*/g; return [[/\/\*[\s\S]*?\*\//g, 'tok-com'], [lineComment, 'tok-com'], [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, 'tok-str'], [new RegExp('\\b(?:' + kws + ')\\b', 'g'), 'tok-kw'], [/-?\b\d+(?:\.\d+)?\b/g, 'tok-num']] }
    function tokenize(line, rules) { const out = []; let i = 0; const n = line.length; while (i < n) { let best = null; for (const r of rules) { r[0].lastIndex = i; const m = r[0].exec(line); if (m && m.index === i && (best === null || m[0].length > best[0].length)) best = [m[0], r[1]] } if (best) { out.push(best); i += best[0].length } else { out.push([line[i], null]); i += 1 } } return out }
    function renderLine(line, lang) { const segs = tokenize(line, buildRules(lang)); return el('span', { className: 'dshide-linetext' }, segs.map(function (s, i) { return s[1] ? el('span', { key: i, className: s[1] }, s[0]) : s[0] })) }

    // 中心编辑器 docStore：与侧栏共享的模块级文档/diff tab 列表。
    const docStore = {
      tabs: [], activeId: null, listeners: [],
      subscribe: function (fn) { this.listeners.push(fn); return function () { const i = docStore.listeners.indexOf(fn); if (i >= 0) docStore.listeners.splice(i, 1) } },
      emit: function () { for (const fn of this.listeners) { try { fn() } catch (e) {} } },
      add: function (tab) { const ex = this.tabs.find(function (t) { return t.key === tab.key }); if (ex) { this.activeId = tab.key; this.emit(); return } this.tabs.push(tab); this.activeId = tab.key; this.emit() },
      close: function (key) { const i = this.tabs.findIndex(function (t) { return t.key === key }); if (i < 0) return; this.tabs.splice(i, 1); if (this.activeId === key) { const next = this.tabs[i] || this.tabs[i - 1]; this.activeId = next ? next.key : null } this.emit() },
      setActive: function (key) { if (this.activeId !== key) { this.activeId = key; this.emit() } },
    }
    // 视图切换：优先 conversation 服务 setView(view, sessionId)（补丁后可用），
    // 回退为点击一级标签按钮（shipped 自带 onClick，绕开缓存/补丁问题）。
    function setViewViaService(sessionId, viewId) {
      try {
        if (!sessionId) return false
        const conv = ctx.get('conversation')
        if (conv && typeof conv.setView === 'function') { conv.setView(viewId, sessionId); return true }
      } catch (e) {}
      return false
    }
    function clickTabNow(labels) {
      try {
        const tabs = document.querySelectorAll('[role="tab"]')
        for (let i = 0; i < tabs.length; i++) {
          const txt = (tabs[i].textContent || '').trim()
          for (const l of labels) if (txt === l) { tabs[i].click(); return true }
        }
      } catch (e) {}
      return false
    }
    // 切回「对话」标签：优先按标签文案（对话/Chat），回退到第一个 tab（chat 恒为 order 0）。
    function clickChatTab() {
      try {
        const tabs = document.querySelectorAll('[role="tab"]')
        let first = null
        for (let i = 0; i < tabs.length; i++) {
          const txt = (tabs[i].textContent || '').trim()
          if (!first) first = tabs[i]
          if (txt === '对话' || txt === 'Chat') { tabs[i].click(); return true }
        }
        if (first) { first.click(); return true }
      } catch (e) {}
      return false
    }
    function openDoc(tab, current) {
      docStore.add(tab)
      if (!setViewViaService(current, 'editor')) clickTabNow(['编辑器', 'Editor'])
    }

    function Preview(props) { const lang = detectLang(props.path); const lines = props.content == null ? [] : props.content.split(/\r?\n/); return el('div', { className: 'dshide-view dshide-preview' }, el('div', { className: 'dshide-preview-header' }, el('button', { type: 'button', className: 'dshide-iconbtn', onClick: props.onBack }, el(Icon, { name: 'back', size: 14 })), el('span', { className: 'dshide-preview-path', title: props.path }, props.path || '')), props.loading ? el('div', { className: 'dshide-loading' }, '加载中…') : props.error ? el('div', { className: 'dshide-empty' }, props.error) : el('pre', { className: 'dshide-code' }, lines.map(function (ln, i) { return el('div', { key: i, className: 'dshide-codeline' }, el('span', { className: 'dshide-lineno' }, String(i + 1)), renderLine(ln, lang)) }), props.truncated ? el('div', { className: 'dshide-empty' }, '… 文件过大，已截断') : null)) }
    function DiffView(props) { const lines = (props.diff.stdout || '').split(/\r?\n/); return el('div', { className: 'dshide-view dshide-preview' }, el('div', { className: 'dshide-preview-header' }, el('button', { type: 'button', className: 'dshide-iconbtn', onClick: props.onBack }, el(Icon, { name: 'back', size: 14 })), el('span', { className: 'dshide-preview-path', title: props.diff.path }, props.diff.path || '')), props.diff.loading ? el('div', { className: 'dshide-loading' }, '加载中…') : (props.diff.stderr && !props.diff.stdout) ? el('div', { className: 'dshide-empty' }, props.diff.stderr) : el('pre', { className: 'dshide-code' }, lines.map(function (ln, i) { const cls = ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0 ? 'dshide-diff-line add' : ln.indexOf('-') === 0 && ln.indexOf('---') !== 0 ? 'dshide-diff-line del' : ln.indexOf('@@') === 0 ? 'dshide-diff-line hunk' : 'dshide-diff-line'; return el('div', { key: i, className: cls }, ln || ' ') }))) }

    function FileEditor(props) {
      const [st, setSt] = React.useState({ loading: true })
      React.useEffect(function () { let cancelled = false; setSt({ loading: true }); host.call('ide.readText', { path: props.path }).then(function (r) { if (cancelled) return; setSt({ content: r && r.content, error: r && r.error, truncated: r && r.truncated, loading: false }) }); return function () { cancelled = true } }, [props.path])
      if (st.loading) return el('div', { className: 'dshide-loading' }, '加载中…')
      if (st.error) return el('div', { className: 'dshide-empty' }, st.error)
      const lang = detectLang(props.path); const lines = (st.content || '').split(/\r?\n/)
      return el('div', { className: 'dshide-editor-body' }, el('div', { className: 'dshide-preview-path', title: props.path }, props.path), el('pre', { className: 'dshide-code' }, lines.map(function (ln, i) { return el('div', { key: i, className: 'dshide-codeline' }, el('span', { className: 'dshide-lineno' }, String(i + 1)), renderLine(ln, lang)) }), st.truncated ? el('div', { className: 'dshide-empty' }, '… 文件过大，已截断') : null))
    }
    function DiffEditor(props) {
      const [st, setSt] = React.useState({ loading: true })
      React.useEffect(function () { let cancelled = false; setSt({ loading: true }); host.call('ide.git.diff', { cwd: props.cwd, path: props.path }).then(function (r) { if (cancelled) return; setSt({ stdout: r && r.stdout, stderr: r && r.stderr, loading: false }) }); return function () { cancelled = true } }, [props.cwd, props.path])
      if (st.loading) return el('div', { className: 'dshide-loading' }, '加载中…')
      if (st.stderr && !st.stdout) return el('div', { className: 'dshide-empty' }, st.stderr)
      const lines = (st.stdout || '').split(/\r?\n/)
      return el('div', { className: 'dshide-editor-body' }, el('div', { className: 'dshide-preview-path', title: props.path }, props.path), el('pre', { className: 'dshide-code' }, lines.map(function (ln, i) { const cls = ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0 ? 'dshide-diff-line add' : ln.indexOf('-') === 0 && ln.indexOf('---') !== 0 ? 'dshide-diff-line del' : ln.indexOf('@@') === 0 ? 'dshide-diff-line hunk' : 'dshide-diff-line'; return el('div', { key: i, className: cls }, ln || ' ') })))
    }
    function EditorView() {
      const [state, setState] = React.useState(function () { return { tabs: docStore.tabs, activeId: docStore.activeId } })
      React.useEffect(function () { return docStore.subscribe(function () { setState({ tabs: docStore.tabs, activeId: docStore.activeId }) }) }, [])
      const tabs = state.tabs; const activeId = state.activeId
      const active = tabs.find(function (t) { return t.key === activeId }) || null
      return el('div', { className: 'dshide-editor' }, el('div', { className: 'dshide-etabs' }, tabs.map(function (t) { return el('div', { key: t.key, className: 'dshide-etab' + (t.key === activeId ? ' active' : ''), title: t.path, onClick: function () { docStore.setActive(t.key) } }, el('span', { className: 'dshide-etab-label' }, baseName(t.path) + (t.kind === 'diff' ? ' ⇄' : '')), el('button', { type: 'button', className: 'dshide-etab-close', title: '关闭', onClick: function (e) { e.stopPropagation(); docStore.close(t.key) } }, el(Icon, { name: 'close', size: 11 }))) }), tabs.length === 0 ? el('span', { className: 'dshide-etab-hint' }, '从侧栏打开文件或 diff') : null), active === null ? el('div', { className: 'dshide-editor-empty' }, '在资源管理器 / 搜索 / 源码管理中打开文档') : active.kind === 'file' ? el(FileEditor, { path: active.path }) : el(DiffEditor, { cwd: active.cwd, path: active.path }))
    }

    function Tree(props) {
      const isOpen = props.depth === 0 || props.expanded.has(props.path)
      const [entries, setEntries] = React.useState(undefined)
      React.useEffect(function () {
        let cancelled = false
        setEntries(undefined)
        host.call('ide.listDir', { path: props.path }).then(function (r) {
          if (cancelled) return
          setEntries((r && r.error) ? [] : ((r && r.entries) || []))
        })
        return function () { cancelled = true }
      }, [props.path, isOpen])
      const f = (props.filter || '').toLowerCase()
      const visible = (entries || []).filter(function (e) {
        return (props.showHidden || !(e.name.length > 0 && e.name[0] === '.')) && (f === '' || e.name.toLowerCase().indexOf(f) !== -1)
      })
      return el('div', null, entries === undefined ? el('div', { className: 'dshide-loading' }, '加载中…') : visible.map(function (e) {
        if (e.type === 'directory') {
          const open = props.expanded.has(e.path)
          return el('div', { key: e.path }, el('div', {
            className: 'dshide-row', style: { paddingLeft: (props.depth * 12 + 8) + 'px' },
            draggable: true,
            onDragStart: function (ev) { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move' },
            onDragOver: function (ev) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move' },
            onDrop: function (ev) { ev.preventDefault(); props.onMove(ev.dataTransfer.getData('text/plain'), e.path) },
            onClick: function () { props.toggle(e.path) },
          }, el('span', { className: 'dshide-arrow' + (open ? ' open' : '') }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 15, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: function (ev) { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中打开', onClick: function (ev) { ev.stopPropagation(); host.call('ide.explore', { path: e.path, select: false }) } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: function (ev) { ev.stopPropagation(); props.onRename(e.path, e.name) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: function (ev) { ev.stopPropagation(); props.onDelete(e.path, e.name) } }, el(Icon, { name: 'trash', size: 13 })))), open ? el(Tree, { path: e.path, depth: props.depth + 1, expanded: props.expanded, toggle: props.toggle, onOpen: props.onOpen, showHidden: props.showHidden, filter: props.filter, onRename: props.onRename, onDelete: props.onDelete, onMove: props.onMove }) : null)
        }
        return el('div', {
          key: e.path, className: 'dshide-row', style: { paddingLeft: (props.depth * 12 + 8 + 14) + 'px' },
          draggable: true,
          onDragStart: function (ev) { ev.dataTransfer.setData('text/plain', e.path); ev.dataTransfer.effectAllowed = 'move' },
          onClick: function () { props.onOpen(e.path) },
        }, el(Icon, { name: 'file', size: 15, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, e.name), el('span', { className: 'dshide-row-actions', onClick: function (ev) { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '在资源管理器中显示', onClick: function (ev) { ev.stopPropagation(); host.call('ide.explore', { path: e.path, select: true }) } }, el(Icon, { name: 'locate', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名', onClick: function (ev) { ev.stopPropagation(); props.onRename(e.path, e.name) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除', onClick: function (ev) { ev.stopPropagation(); props.onDelete(e.path, e.name) } }, el(Icon, { name: 'trash', size: 13 }))))
      }))
    }

    function ExplorerView(props) {
      const [expanded, setExpanded] = React.useState(function () { return new Set() })
      const [showHidden, setShowHidden] = React.useState(false)
      const [filter, setFilter] = React.useState('')
      const [action, setAction] = React.useState(null)
      const [input, setInput] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const seen = {}
      const options = (props.workspaces || []).map(function (w) { return { path: w.path, title: w.title || w.path } }).filter(function (o) { if (seen[o.path]) return false; seen[o.path] = true; return true })
      if (props.root && !seen[props.root]) options.unshift({ path: props.root, title: props.root })
      function toggle(p) { setExpanded(function (prev) { const n = new Set(prev); if (n.has(p)) n.delete(p); else n.add(p); return n }) }
      function openFile(path) { openDoc({ key: path, kind: 'file', path: path }, props.current) }
      function refresh() { setExpanded(new Set()) }
      function move(src, dest) { if (src && src !== dest) host.call('ide.rename', { from: src, to: joinPath(dest, baseName(src)) }).then(refresh) }
      function paste() { setBusy(true); host.call('ide.paste', { dest: props.root }).then(function () { setBusy(false); refresh() }) }
      function startAction(kind, path, name) { setAction({ kind: kind, path: path, name: name || '' }); setInput(name || '') }
      function cancel() { setAction(null); setInput('') }
      function runAction() {
        const a = action
        if (!a) return
        if (a.kind !== 'delete' && input.trim() === '') return
        setBusy(true)
        const done = function () { setBusy(false); setAction(null); setInput(''); refresh() }
        if (a.kind === 'newfile') host.call('ide.newFile', { path: joinPath(a.path, input.trim()) }).then(done)
        else if (a.kind === 'newdir') host.call('ide.mkdir', { path: joinPath(a.path, input.trim()) }).then(done)
        else if (a.kind === 'rename') host.call('ide.rename', { from: a.path, to: joinPath(dirnameOf(a.path), input.trim()) }).then(done)
        else if (a.kind === 'delete') host.call('ide.delete', { path: a.path }).then(done)
      }
      const actionLabel = action ? (action.kind === 'newfile' ? '新建文件' : action.kind === 'newdir' ? '新建文件夹' : action.kind === 'rename' ? '重命名为' : '删除 ' + action.name + ' ?') : ''
      return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('select', { className: 'dshide-select', value: props.root || '', onChange: function (e) { props.setRoot(e.target.value); refresh() } }, options.map(function (o) { return el('option', { key: o.path, value: o.path }, o.title) })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件', onClick: function () { startAction('newfile', props.root, '') } }, el(Icon, { name: 'file', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建文件夹', onClick: function () { startAction('newdir', props.root, '') } }, el(Icon, { name: 'folder', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '粘贴', onClick: paste, disabled: busy }, el(Icon, { name: 'check', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh }, el(Icon, { name: 'refresh', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '按名称查找…', value: filter, onChange: function (e) { setFilter(e.target.value) } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, actionLabel), action.kind !== 'delete' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: function (e) { setInput(e.target.value) }, onKeyDown: function (e) { if (e.key === 'Enter') runAction(); if (e.key === 'Escape') cancel() } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction, disabled: busy }, el(Icon, { name: action.kind === 'delete' ? 'trash' : 'check', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: cancel }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, props.root ? el(Tree, { path: props.root, depth: 0, expanded: expanded, toggle: toggle, onOpen: openFile, showHidden: showHidden, filter: filter, onRename: function (p, n) { startAction('rename', p, n) }, onDelete: function (p, n) { startAction('delete', p, n) }, onMove: move }) : el('div', { className: 'dshide-empty' }, '暂无工作区，请先在会话管理中新建会话或添加工作区。')))
    }

    function SearchView(props) {
      const [query, setQuery] = React.useState('')
      const [cs, setCs] = React.useState(false)
      const [loading, setLoading] = React.useState(false)
      const [result, setResult] = React.useState(null)
      function run() {
        if (!query.trim()) return
        setLoading(true); setResult(null)
        host.call('ide.search', { cwd: props.root, query: query, caseSensitive: cs }).then(function (r) {
          setResult(r || { error: 'no response', matches: [], files: 0, truncated: false }); setLoading(false)
        })
      }
      function openFile(path) { openDoc({ key: path, kind: 'file', path: path }, props.current) }
      return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-search-box' }, el('input', { className: 'dshide-search-input', placeholder: '在工作区中搜索…', value: query, onChange: function (e) { setQuery(e.target.value) }, onKeyDown: function (e) { if (e.key === 'Enter') run() } }), el('button', { type: 'button', className: 'dshide-iconbtn', title: '区分大小写', onClick: function () { setCs(function (v) { return !v }) }, style: cs ? { color: 'var(--dsw-alias-brand-primary)' } : undefined }, 'Aa'), el('button', { type: 'button', className: 'dshide-iconbtn', title: '搜索', onClick: run }, el(Icon, { name: 'search', size: 15 }))), loading ? el('div', { className: 'dshide-loading' }, '搜索中…') : result == null ? el('div', { className: 'dshide-empty' }, '输入关键字，在工作区文件中搜索内容。') : result.error ? el('div', { className: 'dshide-empty' }, result.error) : el('div', { className: 'dshide-results' }, el('div', { className: 'dshide-result-summary' }, result.matches.length + ' 处匹配 · ' + result.files + ' 个文件' + (result.truncated ? '（已截断）' : '')), result.matches.length === 0 ? el('div', { className: 'dshide-empty' }, '未找到匹配结果。') : result.matches.map(function (m, i) { return el('div', { key: i, className: 'dshide-match', onClick: function () { openFile(m.path) } }, el('div', { className: 'dshide-match-path' }, m.path), el('div', { className: 'dshide-match-line' }, el('span', { className: 'dshide-match-lineno' }, String(m.line)), el('span', { className: 'dshide-match-text' }, m.text))) })))
    }

    function ScmView(props) {
      const [status, setStatus] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [message, setMessage] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      function refresh() {
        if (!props.root) return
        setLoading(true)
        host.call('ide.git.status', { cwd: props.root }).then(function (r) {
          setStatus(r || { branch: '', changes: [], notRepo: true, error: 'no response' }); setLoading(false)
        })
      }
      React.useEffect(function () { refresh() }, [props.root])
      function act(method, payload) { setBusy(true); host.call(method, payload).then(function (r) { setBusy(false); refresh() }) }
      function openDiff(path) { openDoc({ key: 'diff:' + path, kind: 'diff', path: path, cwd: props.root }, props.current) }
      function commit() {
        if (!message.trim()) return
        setBusy(true)
        host.call('ide.git.commit', { cwd: props.root, message: message }).then(function (r) { setBusy(false); setMessage(''); refresh() })
      }
      const changes = (status && status.changes) || []
      const staged = changes.filter(function (c) { return c.staged && c.staged !== ' ' })
      const unstaged = changes.filter(function (c) { return !c.staged || c.staged === ' ' })
      const untracked = changes.filter(function (c) { return c.xy === '??' })
      function row(c, action, iconName) {
        return el('div', { key: c.path, className: 'dshide-row', onClick: function () { openDiff(c.path) } }, el('span', { className: 'dshide-scm-status', title: c.xy }, c.staged || c.unstaged || '?'), el('span', { className: 'dshide-name' }, c.path), c.renameFrom ? el('span', { className: 'dshide-rename' }, '← ' + c.renameFrom) : null, el('span', { className: 'dshide-row-actions', onClick: function (ev) { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: action === 'stage' ? '暂存' : '取消暂存', onClick: function (ev) { ev.stopPropagation(); act(action === 'stage' ? 'ide.git.stage' : 'ide.git.unstage', { cwd: props.root, paths: [c.path] }) } }, el(Icon, { name: action === 'stage' ? 'plus' : 'minus', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '丢弃更改', onClick: function (ev) { ev.stopPropagation(); act('ide.git.discard', { cwd: props.root, path: c.path, untracked: c.xy === '??' }) } }, el(Icon, { name: 'trash', size: 13 }))))
      }
      function group(label, list, action, iconName) {
        if (list.length === 0) return null
        return el('div', { className: 'dshide-scm-group' }, el('div', { className: 'dshide-scm-group-title' }, label + ' (' + list.length + ')'), list.map(function (c) { return row(c, action, iconName) }))
      }
      return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '源代码管理'), el('span', { className: 'dshide-branch', title: (status && status.branch) || '' }, el(Icon, { name: 'scm', size: 14 }), el('span', null, (status && status.branch) || '')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '暂存全部', onClick: function () { act('ide.git.stageAll', { cwd: props.root }) }, disabled: busy }, el(Icon, { name: 'plus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消暂存全部', onClick: function () { act('ide.git.unstageAll', { cwd: props.root }) }, disabled: busy }, el(Icon, { name: 'minus', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '刷新', onClick: refresh, disabled: busy }, el(Icon, { name: 'refresh', size: 14 }))), el('div', { className: 'dshide-commit' }, el('textarea', { className: 'dshide-commit-input', placeholder: '提交信息（Ctrl+Enter 提交）', value: message, onChange: function (e) { setMessage(e.target.value) }, onKeyDown: function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') commit() } }), el('button', { type: 'button', className: 'dshide-commit-btn', disabled: !message.trim() || staged.length === 0 || busy, onClick: commit }, busy ? '…' : '提交')), loading ? el('div', { className: 'dshide-loading' }, '读取中…') : status == null ? null : status.notRepo ? el('div', { className: 'dshide-empty' }, '当前工作区不是 Git 仓库。') : status.error ? el('div', { className: 'dshide-empty' }, status.error) : el('div', { className: 'dshide-scm' }, changes.length === 0 ? el('div', { className: 'dshide-empty' }, '没有未提交的更改。') : el('div', null, group('已暂存', staged, 'unstage', 'minus'), group('更改', unstaged, 'stage', 'plus'), group('未跟踪', untracked, 'stage', 'plus'))))
    }

    function SessionView(props) {
      const wsState = props.wsState; const sessState = props.sessState
      const ids = (sessState && sessState.ids) || []; const byId = (sessState && sessState.byId) || {}; const current = sessState && sessState.current
      const workspaces = (wsState && wsState.items) || []; const archived = new Set((wsState && wsState.archivedSessionIds) || [])
      const sessionsSvc = ctx.get('sessions'); const workspacesSvc = ctx.get('workspaces')
      const [view, setView] = React.useState('group'); const [expanded, setExpanded] = React.useState(function () { return new Set() }); const [query, setQuery] = React.useState(''); const [results, setResults] = React.useState(null); const [action, setAction] = React.useState(null); const [input, setInput] = React.useState('')
      React.useEffect(function () {
        const q = query.trim()
        if (q === '') { setResults(null); return }
        let cancelled = false
        const ctrl = new AbortController()
        const timer = window.setTimeout(function () {
          if (sessionsSvc && sessionsSvc.search) sessionsSvc.search(q, ctrl.signal).then(function (r) { if (!cancelled) setResults((r && r.items) ? r : { items: [], hasMore: false }) }).catch(function () { if (!cancelled) setResults({ items: [], hasMore: false }) })
          else setResults({ items: [], hasMore: false })
        }, 250)
        return function () { cancelled = true; window.clearTimeout(timer); try { ctrl.abort() } catch (e) {} }
      }, [query])
      const q = query.trim().toLowerCase()
      const workspaceBySession = {}
      for (const w of workspaces) for (const sid of w.sessionIds) if (!workspaceBySession[sid]) workspaceBySession[sid] = w.title
      const visible = function (s) { return s && s.origin !== 'subagent' && !archived.has(s.id) && (!s.blank || s.id === current) }
      const label = function (s) { return workspaceBySession[s.id] || (s.cwd ? s.cwd.replace(/[\\/]+$/, '').split(/[\\/]/).pop() : '') }
      function open(id) {
        if (sessionsSvc) sessionsSvc.open(id)
        // 强制切回「对话」标签。服务路径（补丁后可达）优先；否则走 DOM 兜底：
        // 点当前会话可立即点；跨会话切换是异步的，用递增延时重试，确保点在新会话的标签上。
        if (setViewViaService(id, 'chat')) return
        if (id === current) {
          clickChatTab()
        } else {
          [150, 350, 650, 1100].forEach(function (d) { window.setTimeout(clickChatTab, d) })
        }
      }
      function newSession() { if (workspacesSvc) workspacesSvc.startSession() }
      function addWorkspace() { if (workspacesSvc) workspacesSvc.pickDirectory().then(function (p) { if (p) workspacesSvc.create({ path: p }) }) }
      function forkSession(id) { if (sessionsSvc) sessionsSvc.fork({ sessionId: id, increaseTitle: true }).then(function (cid) { if (cid && sessionsSvc) sessionsSvc.open(cid) }) }
      function archiveSession(id) { if (workspacesSvc) workspacesSvc.archiveSession(id) }
      function toggleGroup(k) { setExpanded(function (prev) { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n }) }
      function startRenameWs(w) { setAction({ kind: 'wrename', id: w.workspaceId, name: w.title }); setInput(w.title) }
      function startDeleteWs(w) { setAction({ kind: 'wdelete', id: w.workspaceId, name: w.title }) }
      function runAction() { const a = action; if (!a) return; const done = function () { setAction(null); setInput('') }; if (a.kind === 'wrename' && input.trim()) workspacesSvc.rename(a.id, input.trim()).then(done); else if (a.kind === 'wdelete') workspacesSvc.delete(a.id).then(done) }
      function sessionState(s) { if (s.pendingInteraction) return 'warning'; if (s.running) return 'ongoing'; if (s.completed) return 'done'; return 'idle' }
      function sessionRow(s, indent) {
        return el('div', { key: s.id, className: 'dshide-row' + (s.id === current ? ' selected' : ''), style: indent ? { paddingLeft: '18px' } : undefined, title: s.displayTitle, onClick: function () { open(s.id) } }, el(StateDot, { state: sessionState(s), size: 10 }), el('span', { className: 'dshide-name' }, s.displayTitle || s.id), el('span', { className: 'dshide-time' }, relTime(s.updatedAt)), el('span', { className: 'dshide-row-actions', onClick: function (ev) { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '派生会话', onClick: function (ev) { ev.stopPropagation(); forkSession(s.id) } }, el(Icon, { name: 'scm', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '归档', onClick: function (ev) { ev.stopPropagation(); archiveSession(s.id) } }, el(Icon, { name: 'trash', size: 13 }))))
      }
      function workspaceRow(w) {
        const members = (w.sessionIds || []).map(function (id) { return byId[id] }).filter(visible).sort(function (a, b) { return b.updatedAt - a.updatedAt })
        const open = expanded.has(w.workspaceId)
        return el('div', { key: w.workspaceId }, el('div', { className: 'dshide-wsgroup-title', title: w.path, onClick: function () { toggleGroup(w.workspaceId) } }, el('span', { className: 'dshide-arrow' + (open ? ' open' : '') }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 14, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, w.title), el('span', { className: 'dshide-row-actions', onClick: function (ev) { ev.stopPropagation() } }, el('button', { type: 'button', className: 'dshide-row-btn', title: '重命名工作区', onClick: function (ev) { ev.stopPropagation(); startRenameWs(w) } }, el(Icon, { name: 'edit', size: 13 })), el('button', { type: 'button', className: 'dshide-row-btn', title: '删除工作区', onClick: function (ev) { ev.stopPropagation(); startDeleteWs(w) } }, el(Icon, { name: 'trash', size: 13 })))), open ? members.map(function (s) { return sessionRow(s, true) }) : null)
      }
      let body
      if (q !== '') {
        const local = ids.map(function (id) { return byId[id] }).filter(function (s) { return visible(s) && (s.displayTitle.toLowerCase().indexOf(q) !== -1 || label(s).toLowerCase().indexOf(q) !== -1) }).sort(function (a, b) { return b.updatedAt - a.updatedAt })
        const content = (results && results.items) || []
        const merged = local.map(function (s) { return { id: s.id, title: s.displayTitle, ws: label(s), s: s } })
        const seenIds = {}
        merged.forEach(function (m) { seenIds[m.id] = true })
        content.forEach(function (c) { if (!seenIds[c.sessionId] && byId[c.sessionId]) merged.push({ id: c.sessionId, title: byId[c.sessionId].displayTitle, ws: label(byId[c.sessionId]), snippet: c.snippet, s: byId[c.sessionId] }) })
        body = merged.slice(0, 20).map(function (m) { return el('div', { key: m.id, className: 'dshide-row', onClick: function () { open(m.id) } }, el(StateDot, { state: sessionState(m.s), size: 10 }), el('span', { className: 'dshide-name' }, m.title), m.ws ? el('span', { className: 'dshide-rename' }, m.ws) : null, m.snippet ? el('span', { className: 'dshide-time' }, m.snippet) : null) })
        if (body.length === 0) body = el('div', { className: 'dshide-empty' }, '未找到匹配的会话。')
      } else if (view === 'flat') {
        const flat = ids.map(function (id) { return byId[id] }).filter(visible).sort(function (a, b) { return b.updatedAt - a.updatedAt })
        body = flat.length === 0 ? el('div', { className: 'dshide-empty' }, '暂无会话。') : flat.map(function (s) { return sessionRow(s, false) })
      } else {
        const accounted = new Set()
        const groups = workspaces.map(function (w) { w.sessionIds.forEach(function (id) { accounted.add(id) }); return workspaceRow(w) })
        const stray = ids.map(function (id) { return byId[id] }).filter(function (s) { return visible(s) && !accounted.has(s.id) }).sort(function (a, b) { return b.updatedAt - a.updatedAt })
        if (stray.length > 0) groups.push(el('div', { key: '__ungrouped' }, el('div', { className: 'dshide-wsgroup-title' }, el('span', { className: 'dshide-arrow' }, el(Icon, { name: 'chevron', size: 12 })), el(Icon, { name: 'folder', size: 14, className: 'dshide-glyph' }), el('span', { className: 'dshide-name' }, '未分组')), stray.map(function (s) { return sessionRow(s, true) })))
        body = groups
      }
      return el('div', { className: 'dshide-view' }, el('div', { className: 'dshide-toolbar' }, el('span', { className: 'dshide-title' }, '会话管理'), el('div', { className: 'dshide-seg' }, el('button', { type: 'button', className: 'dshide-seg-btn' + (view === 'group' ? ' on' : ''), onClick: function () { setView('group') } }, '按工作区'), el('button', { type: 'button', className: 'dshide-seg-btn' + (view === 'flat' ? ' on' : ''), onClick: function () { setView('flat') } }, '平铺')), el('button', { type: 'button', className: 'dshide-iconbtn', title: '新建会话', onClick: newSession }, el(Icon, { name: 'chat', size: 15 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '添加工作区', onClick: addWorkspace }, el(Icon, { name: 'plus', size: 15 }))), el('input', { className: 'dshide-search-input', style: { margin: '6px 8px', flex: 'none' }, placeholder: '搜索会话…', value: query, onChange: function (e) { setQuery(e.target.value) } }), action ? el('div', { className: 'dshide-actionbar' }, el('span', { className: 'dshide-actionbar-label' }, action.kind === 'wrename' ? '重命名工作区' : '删除工作区 ' + action.name + ' ?'), action.kind === 'wrename' ? el('input', { className: 'dshide-actionbar-input', autoFocus: true, value: input, onChange: function (e) { setInput(e.target.value) }, onKeyDown: function (e) { if (e.key === 'Enter') runAction(); if (e.key === 'Escape') setAction(null) } }) : null, el('button', { type: 'button', className: 'dshide-iconbtn', title: '确认', onClick: runAction }, el(Icon, { name: action.kind === 'wrename' ? 'check' : 'trash', size: 14 })), el('button', { type: 'button', className: 'dshide-iconbtn', title: '取消', onClick: function () { setAction(null); setInput('') } }, el(Icon, { name: 'close', size: 14 }))) : null, el('div', { className: 'dshide-scroll' }, body))
    }

    function IdeRegion(props) {
      const wide = props.wide; const expandSidebar = props.expandSidebar; const useWorkspaces = props.useWorkspaces; const useSessions = props.useSessions
      const wsState = useWorkspaces ? useWorkspaces(function (s) { return s }) : null
      const sessState = useSessions ? useSessions(function (s) { return s }) : null
      const [active, setActive] = React.useState('sessions')
      const [root, setRoot] = React.useState(undefined)
      const items = (wsState && wsState.items) || []
      const recent = wsState && wsState.recentWorkspaceId
      React.useEffect(function () {
        if (root !== undefined) return
        if (recent) { const w = items.find(function (x) { return x.workspaceId === recent }); if (w && w.path) { setRoot(w.path); return } }
        if (items[0] && items[0].path) { setRoot(items[0].path); return }
        host.call('ide.roots', {}).then(function (r) { if (r && r.root) setRoot(r.root); else if (r && r.workspaces && r.workspaces[0]) setRoot(r.workspaces[0].path) })
      }, [root, recent, items])
      const views = [{ id: 'files', icon: 'explorer', label: '资源管理器' }, { id: 'search', icon: 'search', label: '搜索' }, { id: 'scm', icon: 'scm', label: '源代码管理' }, { id: 'sessions', icon: 'chat', label: '会话管理' }]
      function pick(v) { if (!wide && expandSidebar) expandSidebar(); setActive(v) }
      function buttons() { return views.map(function (v) { return el('button', { key: v.id, type: 'button', title: v.label, 'aria-label': v.label, className: 'dshide-activity-btn' + (wide && active === v.id ? ' active' : ''), onClick: function () { pick(v.id) } }, el(Icon, { name: v.icon, size: 20 })) }) }
      if (!wide) return el('div', { className: 'dshide-region rail' }, buttons())
      return el('div', { className: 'dshide-region' }, el('div', { className: 'dshide-activity' }, buttons()), el('div', { className: 'dshide-content' }, active === 'sessions' ? el(SessionView, { wsState: wsState, sessState: sessState }) : active === 'files' ? el(ExplorerView, { root: root, setRoot: setRoot, workspaces: items, current: sessState && sessState.current }) : active === 'search' ? el(SearchView, { root: root, current: sessState && sessState.current }) : el(ScmView, { root: root, current: sessState && sessState.current })))
    }

    const css = '.dshide-region{height:100%;width:100%;display:flex;flex-direction:row;overflow:hidden;color:var(--dsw-alias-label-primary);font-size:14px;}.dshide-region *{box-sizing:border-box;}.dshide-activity{flex:none;width:44px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border-right:1px solid var(--dsw-alias-border-l1);}.dshide-activity-btn{position:relative;width:44px;height:40px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0;border-radius:8px;}.dshide-activity-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active::before{content:\'\';position:absolute;left:-2px;top:9px;bottom:9px;width:2px;border-radius:0 2px 2px 0;background:var(--dsw-alias-brand-primary);}.dshide-content{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-region.rail{flex-direction:column;align-items:center;gap:2px;padding:6px 0;}.dshide-region.rail .dshide-activity-btn{width:36px;height:36px;}.dshide-view{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-toolbar{flex:none;display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.dshide-select{flex:1;min-width:0;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 6px;}.dshide-iconbtn{width:28px;height:28px;flex:none;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;padding:0;font-size:13px;}.dshide-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}.dshide-seg{flex:none;display:flex;align-items:center;background:var(--dsw-alias-bg-layer-2,transparent);border-radius:6px;padding:1px;}.dshide-seg-btn{height:24px;padding:0 10px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;border-radius:5px;}.dshide-seg-btn.on{background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.1);}.dshide-scroll{flex:1;min-height:0;overflow:auto;}.dshide-row{display:flex;align-items:center;gap:6px;height:32px;flex:none;padding:0 8px;cursor:pointer;user-select:none;white-space:nowrap;color:var(--dsw-alias-label-primary);}.dshide-row:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-row.selected{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-arrow{width:14px;flex:none;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);transition:transform .12s ease;}.dshide-arrow.open{transform:rotate(90deg);}.dshide-glyph{flex:none;color:var(--dsw-alias-label-secondary);}.dshide-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:14px;line-height:20px;}.dshide-time{flex:none;color:var(--dsw-alias-label-secondary);font-size:12px;}.dshide-dot{flex:none;border-radius:50%;display:inline-block;}.dshide-dot-done{background:var(--dsw-alias-state-success-primary);}.dshide-dot-warning{background:var(--dsw-alias-state-warn-primary);}.dshide-dot-error{background:var(--dsw-alias-state-error-primary);}.dshide-dot-idle{background:var(--dsw-alias-label-secondary);opacity:.35;}.dshide-dot-matrix{flex:none;display:block;}.dshide-dot-cell{fill:var(--dsw-alias-brand-primary);animation:dshide-blink 1s linear infinite;}@keyframes dshide-blink{0%,100%{opacity:.2}50%{opacity:1}}.dshide-wsgroup-title{display:flex;align-items:center;gap:6px;height:34px;flex:none;padding:0 8px;cursor:pointer;user-select:none;font-weight:600;font-size:13px;color:var(--dsw-alias-label-primary);}.dshide-wsgroup-title:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-loading{padding:16px;color:var(--dsw-alias-label-secondary);font-size:14px;}.dshide-empty{padding:16px 14px;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:20px;}.dshide-preview-header{height:36px;flex:none;display:flex;align-items:center;gap:6px;padding:0 6px 0 4px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-preview-path{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Consolas,monospace;font-size:12px;color:var(--dsw-alias-label-secondary);}.dshide-code{flex:1;min-height:0;overflow:auto;margin:0;padding:8px 0;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:20px;}.dshide-codeline{display:flex;}.dshide-lineno{flex:none;width:44px;text-align:right;padding-right:12px;color:var(--dsw-alias-label-secondary);user-select:none;opacity:.6;}.dshide-linetext{white-space:pre;}.tok-kw{color:var(--dsw-alias-brand-primary);}.tok-str{color:var(--dsw-alias-state-success-primary);}.tok-com{color:var(--dsw-alias-label-secondary);font-style:italic;opacity:.7;}.tok-num{color:var(--dsw-alias-state-warn-primary);}.tok-bool{color:var(--dsw-alias-brand-primary);}.tok-tag{color:var(--dsw-alias-brand-primary);}.tok-attr{color:var(--dsw-alias-state-warn-primary);}.tok-prop{color:var(--dsw-alias-label-primary);}.tok-json-key{color:var(--dsw-alias-brand-primary);}.tok-md-heading{color:var(--dsw-alias-label-primary);font-weight:700;}.tok-bold{font-weight:700;}.tok-link{color:var(--dsw-alias-brand-primary);text-decoration:underline;}.dshide-row-actions{flex:none;display:none;align-items:center;gap:2px;}.dshide-row:hover .dshide-row-actions,.dshide-wsgroup-title:hover .dshide-row-actions{display:flex;}.dshide-row-btn{flex:none;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:4px;padding:0;}.dshide-row-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}.dshide-actionbar{flex:none;display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-actionbar-label{flex:none;font-size:14px;color:var(--dsw-alias-label-secondary);}.dshide-actionbar-input{flex:1;min-width:0;height:28px;border:1px solid var(--dsw-alias-brand-primary);border-radius:6px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 8px;outline:none;}.dshide-search-box{flex:none;display:flex;align-items:center;gap:4px;padding:8px;}.dshide-search-input{flex:1;min-width:0;height:32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 10px;outline:none;}.dshide-search-input:focus{border-color:var(--dsw-alias-brand-primary);}.dshide-results{flex:1;min-height:0;overflow:auto;}.dshide-result-summary{padding:8px 12px;font-size:13px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match{padding:6px 12px;cursor:pointer;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-match-path{font-size:13px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;}.dshide-match-line{display:flex;gap:8px;font-family:ui-monospace,Consolas,monospace;font-size:12px;}.dshide-match-lineno{flex:none;color:var(--dsw-alias-brand-primary);min-width:20px;text-align:right;}.dshide-match-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary);}.dshide-scm{flex:1;min-height:0;overflow:auto;}.dshide-scm-group-title{padding:10px 12px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);}.dshide-scm-status{flex:none;width:14px;text-align:center;font-family:ui-monospace,monospace;font-weight:700;font-size:13px;color:var(--dsw-alias-state-warn-primary);}.dshide-branch{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:14px;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 4px;}.dshide-rename{color:var(--dsw-alias-label-secondary);font-size:12px;}.dshide-diff-line{white-space:pre;padding-left:8px;}.dshide-diff-line.add{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-state-success-primary);}.dshide-diff-line.del{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);}.dshide-diff-line.hunk{color:var(--dsw-alias-brand-primary);}.dshide-commit{flex:none;display:flex;gap:6px;padding:8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-commit-input{flex:1;min-width:0;height:56px;resize:none;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:8px;font-family:inherit;outline:none;}.dshide-commit-input:focus{border-color:var(--dsw-alias-brand-primary);}.dshide-commit-btn{flex:none;align-self:flex-start;height:28px;padding:0 12px;border:0;border-radius:6px;background:var(--dsw-alias-brand-primary);color:#fff;font-size:14px;cursor:pointer;}.dshide-commit-btn:disabled{opacity:.4;cursor:default;}'
    ctx.effect(function () { return styles.insert(css) })
    ctx.effect(function () { return styles.insert('.dshide-editor{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;width:100%;}.dshide-etabs{flex:none;display:flex;align-items:stretch;gap:2px;padding:6px 8px 0;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-x:auto;background:var(--dsw-alias-bg-base);}.dshide-etab{flex:none;display:flex;align-items:center;gap:6px;max-width:200px;height:28px;padding:0 6px 0 10px;border:1px solid transparent;border-bottom:none;border-radius:6px 6px 0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;line-height:26px;}.dshide-etab:hover{background:var(--dsw-alias-interactive-bg-hover);}.dshide-etab.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l1);}.dshide-etab-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.dshide-etab-close{width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;border-radius:4px;padding:0;}.dshide-etab-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);}.dshide-etab-hint{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:28px;padding-left:4px;}.dshide-editor-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;}.dshide-editor-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-editor-body .dshide-preview-path{flex:none;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-editor-body .dshide-code{flex:1;min-height:0;overflow:auto;}')})

    slots.inject('sidebar.workspaces', function () { return slots.register({ name: 'sidebar.workspaces', priority: -1 }, IdeRegion) })

    // 一级「编辑器」标签页：与「对话/轨迹」并列（order 20），内部为多文档/diff tab。
    slots.inject('conversation.view', function () { return slots.register({ name: 'conversation.view', id: 'editor', order: 20, label: '编辑器' }, EditorView) })
  },
}
