import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://lpgvgevbzpuhjmcsejrg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZ3ZnZXZienB1aGptY3NlanJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDMyNDYsImV4cCI6MjA5ODA3OTI0Nn0.QB77CKwU-lW4i_CvmP04e7j-lp9-xjpPwZTiLPFPwZA";
const H = { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=representation" };
const API = (path) => `${SUPABASE_URL}/rest/v1/${path}`;

async function sb(path, method = "GET", body = null) {
  const res = await fetch(API(path), { method, headers: H, body: body ? JSON.stringify(body) : null });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  if (method === "DELETE") return true;
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const fmt  = v => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
const pct  = v => `${Number(v).toFixed(1)}%`;
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const tod  = () => new Date().toISOString().slice(0, 10);
const TABS = ["PP","P","M","G","GG","1","2","3","4","6","8","10","12","14","16"];
const PGTOS = [{value:"dinheiro",label:"Dinheiro"},{value:"boleto",label:"Boleto"},{value:"cartao",label:"Cartão"},{value:"notinha",label:"Notinha"}];
const pgtoLabel = v => ({dinheiro:"💵 Dinheiro",boleto:"🧾 Boleto",cartao:"💳 Cartão",notinha:"📝 Notinha"}[v]||v);
const pgtoColor = v => ({dinheiro:"#16a34a",boleto:"#2563eb",cartao:"#7c3aed",notinha:"#d97706"}[v]||"#64748b");
const pgtoBg    = v => ({dinheiro:"#dcfce7",boleto:"#dbeafe",cartao:"#ede9fe",notinha:"#fef3c7"}[v]||"#f1f5f9");

const C = { bg:"#f0f3f8",card:"#fff",navy:"#0d2137",accent:"#2563eb",green:"#16a34a",greenL:"#dcfce7",red:"#dc2626",redL:"#fee2e2",gold:"#d97706",goldL:"#fef3c7",muted:"#64748b",border:"#e2e8f0",text:"#0f172a",textS:"#475569" };

const Btn = ({children,onClick,variant="primary",size="md",disabled,style}) => {
  const sz = {sm:{padding:"5px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};
  const vr = {primary:{background:C.accent,color:"#fff"},success:{background:C.green,color:"#fff"},danger:{background:C.red,color:"#fff"},ghost:{background:"transparent",color:C.muted,border:`1.5px solid ${C.border}`},navy:{background:C.navy,color:"#fff"}};
  return <button onClick={disabled?undefined:onClick} style={{border:"none",borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",transition:"all .15s",opacity:disabled?.5:1,...sz[size],...vr[variant],...style}}>{children}</button>;
};
const Inp = ({label,value,onChange,type="text",placeholder,style,min,readOnly}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} readOnly={readOnly}
      style={{padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",color:C.text,fontFamily:"inherit",background:readOnly?"#f1f5f9":"#fafbfc",...style}}/>
  </div>
);
const Sel = ({label,value,onChange,options,style}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,fontFamily:"inherit",background:"#fafbfc",...style}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Card = ({children,style}) => <div style={{background:C.card,borderRadius:14,boxShadow:"0 1px 6px rgba(0,0,0,.07)",padding:"20px 22px",...style}}>{children}</div>;
const Badge = ({children,color=C.accent,bg="#dbeafe"}) => <span style={{background:bg,color,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
const Modal = ({title,onClose,children,wide}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:wide?780:580,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:"#fff",zIndex:1}}>
        <span style={{fontWeight:800,fontSize:16,color:C.navy}}>{title}</span>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:20,cursor:"pointer",color:C.muted}}>✕</button>
      </div>
      <div style={{padding:"22px"}}>{children}</div>
    </div>
  </div>
);
const Th = ({children,center}) => <th style={{padding:"10px 10px",textAlign:center?"center":"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</th>;
const Td = ({children,center,bold,color,style}) => <td style={{padding:"9px 10px",textAlign:center?"center":"left",fontWeight:bold?700:400,color:color||C.text,...style}}>{children}</td>;
const Loader = ({msg}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60,gap:16}}>
    <div style={{width:40,height:40,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.accent}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{color:C.muted,fontSize:13}}>{msg||"Carregando..."}</div>
  </div>
);
const Toast = ({msg,type}) => (
  <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:type==="erro"?C.red:C.green,color:"#fff",borderRadius:10,padding:"12px 20px",fontWeight:700,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,.2)",maxWidth:320}}>
    {type==="erro"?"❌ ":"✅ "}{msg}
  </div>
);

export default function App() {
  const [aba, setAba] = useState("dashboard");
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods, peds, cmps, pItens, cItens] = await Promise.all([
        sb("categorias?order=nome"),
        sb("produtos?order=nome"),
        sb("pedidos?order=created_at.desc"),
        sb("compras?order=created_at.desc"),
        sb("pedido_itens?order=id"),
        sb("compra_itens?order=id"),
      ]);
      setCategorias(cats);
      setProdutos(prods.map(p=>({...p,custo:Number(p.custo),venda:Number(p.venda)})));
      setPedidos(peds.map(ped=>({...ped,itens:pItens.filter(i=>i.pedido_id===ped.id).map(i=>({...i,qtd:Number(i.qtd)}))})));
      setCompras(cmps.map(c=>({...c,itens:cItens.filter(i=>i.compra_id===c.id).map(i=>({...i,qtd:Number(i.qtd),custoUnit:Number(i.custo_unit)}))})));
    } catch(e) { showToast("Erro ao carregar: "+e.message,"erro"); }
    setLoading(false);
  }, []);

  useEffect(()=>{ carregar(); },[carregar]);

  let tv=0,tc=0,tp=0;
  pedidos.forEach(ped=>ped.itens.forEach(it=>{const p=produtos.find(x=>x.id===it.ref_id);if(p){tv+=p.venda*it.qtd;tc+=p.custo*it.qtd;tp+=it.qtd;}}));
  const g = {venda:tv,custo:tc,lucro:tv-tc,margem:tv>0?(tv-tc)/tv*100:0,pecas:tp};

  const tabs = [{id:"dashboard",label:"📊 Dashboard"},{id:"produtos",label:"📦 Produtos"},{id:"pedidos",label:"📋 Pedidos"},{id:"compras",label:"🛒 Compras"},{id:"categorias",label:"🏷️ Categorias"},{id:"relatorio",label:"📈 Relatório"}];

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.bg,minHeight:"100vh"}}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}
      <div style={{background:C.navy,padding:"0 20px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{padding:"14px 0 0",color:"#fff"}}>
            <div style={{fontSize:10,letterSpacing:3,color:"#7fb3d3",textTransform:"uppercase"}}>Sistema de Gestão</div>
            <div style={{fontSize:20,fontWeight:900}}>Moda & Vendas ☁️</div>
          </div>
          <div style={{display:"flex",gap:2,marginTop:14,overflowX:"auto"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setAba(t.id)} style={{background:aba===t.id?"#fff":"transparent",color:aba===t.id?C.navy:"rgba(255,255,255,.75)",border:"none",borderRadius:"8px 8px 0 0",padding:"9px 14px",cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"inherit",whiteSpace:"nowrap"}}>{t.label}</button>)}
            <button onClick={carregar} style={{background:"transparent",color:"rgba(255,255,255,.6)",border:"none",cursor:"pointer",fontSize:16,padding:"9px 14px",marginLeft:"auto"}} title="Atualizar">🔄</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
        {loading ? <Loader msg="Conectando ao banco de dados..."/> : <>
          {aba==="dashboard"  && <Dashboard g={g} pedidos={pedidos} produtos={produtos}/>}
          {aba==="produtos"   && <Produtos produtos={produtos} categorias={categorias} compras={compras} carregar={carregar} showToast={showToast}/>}
          {aba==="pedidos"    && <Pedidos pedidos={pedidos} produtos={produtos} carregar={carregar} showToast={showToast}/>}
          {aba==="compras"    && <Compras compras={compras} produtos={produtos} carregar={carregar} showToast={showToast}/>}
          {aba==="categorias" && <Categorias categorias={categorias} produtos={produtos} carregar={carregar} showToast={showToast}/>}
          {aba==="relatorio"  && <Relatorio pedidos={pedidos} produtos={produtos} categorias={categorias}/>}
        </>}
      </div>
    </div>
  );
}

function Dashboard({g,pedidos,produtos}){
  const top=produtos.map(p=>{const qtd=pedidos.reduce((s,ped)=>s+ped.itens.filter(i=>i.ref_id===p.id).reduce((si,i)=>si+i.qtd,0),0);return{...p,qtd,lucroTotal:(p.venda-p.custo)*qtd};}).filter(p=>p.qtd>0).sort((a,b)=>b.lucroTotal-a.lucroTotal).slice(0,5);
  const pr={};pedidos.forEach(ped=>{const k=ped.pagamento||"outros";if(!pr[k])pr[k]={qtd:0,valor:0};pr[k].qtd++;ped.itens.forEach(it=>{const p=produtos.find(x=>x.id===it.ref_id);if(p)pr[k].valor+=p.venda*it.qtd;});});
  return(
    <div>
      <h2 style={{color:C.navy,margin:"0 0 18px",fontSize:18,fontWeight:800}}>Visão Geral</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:24}}>
        {[{label:"Total Vendas",value:fmt(g.venda),icon:"💰",color:C.accent},{label:"Custo Total",value:fmt(g.custo),icon:"🏷️",color:C.gold},{label:"Lucro Líquido",value:fmt(g.lucro),icon:"📈",color:C.green},{label:"Margem Geral",value:pct(g.margem),icon:"🎯",color:"#7c3aed"},{label:"Peças Vendidas",value:g.pecas,icon:"📦",color:C.navy},{label:"Pedidos",value:pedidos.length,icon:"📋",color:C.muted}].map(c=>(
          <Card key={c.label} style={{padding:"14px 16px"}}><div style={{fontSize:20,marginBottom:4}}>{c.icon}</div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:2}}>{c.label}</div><div style={{fontSize:20,fontWeight:900,color:c.color}}>{c.value}</div></Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <h3 style={{margin:"0 0 14px",fontSize:13,fontWeight:800,color:C.navy}}>🏆 Top Produtos por Lucro</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{["#","Ref.","Produto","Qtd.","Lucro"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:h==="Produto"?"left":"center",color:C.muted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
            <tbody>{top.map((p,i)=><tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,background:i===0?"#fffbeb":"transparent"}}><td style={{padding:"8px",textAlign:"center",fontWeight:800,color:i===0?C.gold:C.muted}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td><td style={{padding:"8px",textAlign:"center"}}><Badge>{p.id}</Badge></td><td style={{padding:"8px",fontWeight:600}}>{p.nome}</td><td style={{padding:"8px",textAlign:"center"}}>{p.qtd}</td><td style={{padding:"8px",textAlign:"center",color:C.green,fontWeight:800}}>{fmt(p.lucroTotal)}</td></tr>)}{top.length===0&&<tr><td colSpan={5} style={{padding:20,textAlign:"center",color:C.muted}}>Sem dados ainda</td></tr>}</tbody>
          </table>
        </Card>
        <Card>
          <h3 style={{margin:"0 0 14px",fontSize:13,fontWeight:800,color:C.navy}}>💳 Por Forma de Pagamento</h3>
          {Object.entries(pr).length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",paddingTop:20}}>Sem pedidos ainda</div>:Object.entries(pr).map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{background:pgtoBg(k),color:pgtoColor(k),borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700}}>{pgtoLabel(k)}</span>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.accent}}>{fmt(v.valor)}</div><div style={{fontSize:10,color:C.muted}}>{v.qtd} pedido(s)</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Produtos({produtos,categorias,compras,carregar,showToast}){
  const [modal,setModal]=useState(null);
  const [detalhe,setDetalhe]=useState(null);
  const [busca,setBusca]=useState("");
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({id:"",nome:"",cor:"",custo:"",venda:"",categoria:""});
  const abrir=p=>{setForm(p?{...p,custo:String(p.custo),venda:String(p.venda)}:{id:"",nome:"",cor:"",custo:"",venda:"",categoria:categorias[0]?.nome||""});setModal(p?"editar":"novo");};
  const salvar=async()=>{
    if(!form.id||!form.nome||!form.venda)return alert("Preencha Ref., Nome e Preço de Venda.");
    setSaving(true);
    try{
      const novo={id:form.id.trim(),nome:form.nome.trim(),cor:form.cor.trim()||"—",custo:parseFloat(form.custo)||0,venda:parseFloat(form.venda)||0,categoria:form.categoria};
      if(modal==="novo") await sb("produtos","POST",novo);
      else await sb(`produtos?id=eq.${novo.id}`,"PATCH",novo);
      await carregar(); showToast("Produto salvo!"); setModal(null);
    }catch(e){showToast(e.message,"erro");}
    setSaving(false);
  };
  const excluir=async id=>{if(!confirm("Excluir produto?"))return;try{await sb(`produtos?id=eq.${id}`,"DELETE");await carregar();showToast("Produto excluído.");}catch(e){showToast(e.message,"erro");}};
  const filtrados=produtos.filter(p=>p.id.includes(busca)||p.nome.toLowerCase().includes(busca.toLowerCase())||(p.cor||"").toLowerCase().includes(busca.toLowerCase()));
  const lucroU=p=>p.venda-p.custo;
  const margemP=p=>p.venda>0?(lucroU(p)/p.venda)*100:0;
  const comprasDoProduto=pid=>{const lista=[];compras.forEach(c=>c.itens.filter(i=>i.ref_id===pid).forEach(i=>{lista.push({...i,data:c.data,fornecedor:c.fornecedor});}));return lista;};
  const sugestao=()=>{if(!form.custo)return null;const cat=categorias.find(c=>c.nome===form.categoria);if(!cat)return null;return parseFloat(form.custo)/(1-cat.margem_min/100);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{color:C.navy,margin:0,fontSize:18,fontWeight:800}}>Produtos ({produtos.length})</h2>
        <Btn onClick={()=>abrir(null)}>+ Novo Produto</Btn>
      </div>
      <Inp value={busca} onChange={setBusca} placeholder="🔍 Buscar ref., nome ou cor..." style={{marginBottom:16}}/>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:C.navy,color:"#fff"}}><Th>Ref.</Th><Th>Nome</Th><Th>Cor</Th><Th>Categoria</Th><Th center>Custo</Th><Th center>Venda</Th><Th center>Lucro</Th><Th center>Margem</Th><Th center>Compras</Th><Th></Th></tr></thead>
          <tbody>
            {filtrados.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#fafbfc"}}>
                <Td><Badge>{p.id}</Badge></Td><Td bold>{p.nome}</Td>
                <Td style={{fontSize:11,color:C.textS}}>{p.cor}</Td>
                <Td><Badge bg="#f1f5f9" color={C.muted}>{p.categoria||"—"}</Badge></Td>
                <Td center color={C.muted}>{fmt(p.custo)}</Td><Td center bold color={C.accent}>{fmt(p.venda)}</Td><Td center bold color={C.green}>{fmt(lucroU(p))}</Td>
                <td style={{padding:"9px 10px",textAlign:"center"}}><span style={{background:margemP(p)>=40?C.greenL:margemP(p)>=20?C.goldL:C.redL,color:margemP(p)>=40?C.green:margemP(p)>=20?C.gold:C.red,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{pct(margemP(p))}</span></td>
                <td style={{padding:"9px 10px",textAlign:"center"}}><Btn onClick={()=>setDetalhe(p)} size="sm" variant="ghost">📦 Histórico</Btn></td>
                <td style={{padding:"9px 10px",textAlign:"right",whiteSpace:"nowrap"}}><Btn onClick={()=>abrir(p)} size="sm" variant="ghost" style={{marginRight:6}}>✏️</Btn><Btn onClick={()=>excluir(p.id)} size="sm" variant="danger">🗑️</Btn></td>
              </tr>
            ))}
            {filtrados.length===0&&<tr><td colSpan={10} style={{padding:32,textAlign:"center",color:C.muted}}>Nenhum produto encontrado.</td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
      {modal&&(
        <Modal title={modal==="novo"?"Novo Produto":"Editar Produto"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{gridColumn:"1/-1"}}><Inp label="Referência" value={form.id} onChange={v=>setForm(f=>({...f,id:v}))} placeholder="Ex: 1825" readOnly={modal==="editar"}/></div>
            <div style={{gridColumn:"1/-1"}}><Inp label="Nome do Produto" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Ex: Camiseta Básica"/></div>
            <div style={{gridColumn:"1/-1"}}><Inp label="Cor(es)" value={form.cor} onChange={v=>setForm(f=>({...f,cor:v}))} placeholder="Ex: AZUL/PRETO"/></div>
            <Sel label="Categoria" value={form.categoria} onChange={v=>setForm(f=>({...f,categoria:v}))} options={[{value:"",label:"Sem categoria"},...categorias.map(c=>({value:c.nome,label:c.nome}))]}/>
            <Inp label="Custo (R$)" value={form.custo} onChange={v=>setForm(f=>({...f,custo:v}))} type="number" min="0" placeholder="0,00"/>
            <Inp label="Preço de Venda (R$)" value={form.venda} onChange={v=>setForm(f=>({...f,venda:v}))} type="number" min="0" placeholder="0,00"/>
          </div>
          {sugestao()&&<div style={{background:"#eff6ff",border:`1px solid #bfdbfe`,borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:C.accent}}>💡 Sugestão de venda pela margem mínima: <strong>{fmt(sugestao())}</strong></div>}
          {form.custo&&form.venda&&<div style={{background:C.greenL,borderRadius:8,padding:"10px 14px",marginTop:10,display:"flex",gap:20}}><span style={{fontSize:12,color:C.green}}>Lucro: <strong>{fmt((parseFloat(form.venda)||0)-(parseFloat(form.custo)||0))}</strong></span><span style={{fontSize:12,color:C.green}}>Margem: <strong>{pct(parseFloat(form.venda)>0?(((parseFloat(form.venda)||0)-(parseFloat(form.custo)||0))/(parseFloat(form.venda)||1))*100:0)}</strong></span></div>}
          <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}><Btn onClick={()=>setModal(null)} variant="ghost">Cancelar</Btn><Btn onClick={salvar} variant="success" disabled={saving}>{saving?"Salvando...":"💾 Salvar"}</Btn></div>
        </Modal>
      )}
      {detalhe&&(
        <Modal title={`📦 Histórico de Compras — ${detalhe.id}`} onClose={()=>setDetalhe(null)}>
          {(()=>{const lista=comprasDoProduto(detalhe.id);if(lista.length===0)return<div style={{color:C.muted,textAlign:"center",padding:32}}>Nenhuma compra registrada.</div>;return(<table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.navy,color:"#fff"}}><Th>Data</Th><Th>Fornecedor</Th><Th center>Qtd.</Th><Th center>Custo Unit.</Th><Th center>Total</Th></tr></thead><tbody>{lista.map((l,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#f8fafc"}}><Td>{l.data?.split("-").reverse().join("/")}</Td><Td>{l.fornecedor}</Td><Td center bold>{l.qtd}</Td><Td center>{fmt(l.custoUnit)}</Td><Td center bold color={C.accent}>{fmt(l.qtd*l.custoUnit)}</Td></tr>)}</tbody></table>);})()}
        </Modal>
      )}
    </div>
  );
}

function Pedidos({pedidos,produtos,carregar,showToast}){
  const [modal,setModal]=useState(null);
  const [detalhe,setDetalhe]=useState(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({cliente:"",data:tod(),pagamento:"dinheiro",itens:[]});
  const [item,setItem]=useState({refId:"",cor:"",tamanho:"M",qtd:1});
  const abrirNovo=()=>{setForm({cliente:"",data:tod(),pagamento:"dinheiro",itens:[]});setItem({refId:produtos[0]?.id||"",cor:produtos[0]?.cor||"",tamanho:"M",qtd:1});setModal("novo");};
  const onRef=v=>{const p=produtos.find(x=>x.id===v);setItem(i=>({...i,refId:v,cor:p?.cor||""}));};
  const addItem=()=>{if(!item.refId||item.qtd<1)return;setForm(f=>({...f,itens:[...f.itens,{...item,qtd:parseInt(item.qtd)}]}));setItem(i=>({...i,qtd:1}));};
  const rmItem=idx=>setForm(f=>({...f,itens:f.itens.filter((_,i)=>i!==idx)}));
  const salvar=async()=>{
    if(!form.cliente)return alert("Informe o cliente.");
    if(form.itens.length===0)return alert("Adicione pelo menos 1 item.");
    setSaving(true);
    try{
      const pedId="PED-"+uid().toUpperCase().slice(0,6);
      await sb("pedidos","POST",{id:pedId,cliente:form.cliente,data:form.data,pagamento:form.pagamento});
      for(const it of form.itens) await sb("pedido_itens","POST",{pedido_id:pedId,ref_id:it.refId,cor:it.cor,tamanho:it.tamanho,qtd:it.qtd});
      await carregar(); showToast("Pedido salvo!"); setModal(null);
    }catch(e){showToast(e.message,"erro");}
    setSaving(false);
  };
  const excluir=async id=>{if(!confirm("Excluir pedido?"))return;try{await sb(`pedidos?id=eq.${id}`,"DELETE");await carregar();showToast("Pedido excluído.");}catch(e){showToast(e.message,"erro");}};
  const calcPed=ped=>{let v=0,c=0,q=0;ped.itens.forEach(it=>{const p=produtos.find(x=>x.id===it.ref_id);if(p){v+=p.venda*it.qtd;c+=p.custo*it.qtd;q+=it.qtd;}});return{venda:v,custo:c,lucro:v-c,qtd:q};};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{color:C.navy,margin:0,fontSize:18,fontWeight:800}}>Pedidos ({pedidos.length})</h2>
        <Btn onClick={abrirNovo}>+ Novo Pedido</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {pedidos.map(ped=>{const {venda,lucro,qtd}=calcPed(ped);return(
          <Card key={ped.id} style={{padding:"14px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
              <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}><Badge bg="#e0e7ff" color="#3730a3">{ped.id}</Badge><span style={{fontWeight:800,color:C.navy,fontSize:15}}>{ped.cliente}</span><span style={{background:pgtoBg(ped.pagamento),color:pgtoColor(ped.pagamento),borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700}}>{pgtoLabel(ped.pagamento)}</span></div><div style={{fontSize:12,color:C.muted}}>{ped.data?.split("-").reverse().join("/")} · {ped.itens.length} linha(s) · {qtd} peças</div></div>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}><div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>Venda</div><div style={{fontWeight:800,color:C.accent,fontSize:16}}>{fmt(venda)}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>Lucro</div><div style={{fontWeight:800,color:C.green,fontSize:16}}>{fmt(lucro)}</div></div><div style={{display:"flex",gap:6}}><Btn onClick={()=>setDetalhe(ped)} size="sm" variant="ghost">👁 Ver</Btn><Btn onClick={()=>excluir(ped.id)} size="sm" variant="danger">🗑️</Btn></div></div>
            </div>
          </Card>
        );})}
        {pedidos.length===0&&<Card style={{textAlign:"center",color:C.muted,padding:40}}>Nenhum pedido registrado.</Card>}
      </div>
      {modal==="novo"&&(
        <Modal title="Novo Pedido" onClose={()=>setModal(null)} wide>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
            <div style={{gridColumn:"1/-1"}}><Inp label="Cliente" value={form.cliente} onChange={v=>setForm(f=>({...f,cliente:v}))} placeholder="Nome do cliente"/></div>
            <Inp label="Data" value={form.data} onChange={v=>setForm(f=>({...f,data:v}))} type="date"/>
            <div style={{gridColumn:"2/-1"}}><Sel label="Forma de Pagamento" value={form.pagamento} onChange={v=>setForm(f=>({...f,pagamento:v}))} options={PGTOS}/></div>
          </div>
          <div style={{background:"#f8fafc",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:10,textTransform:"uppercase"}}>Adicionar Item</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,alignItems:"flex-end"}}>
              <Sel label="Produto" value={item.refId} onChange={onRef} options={produtos.map(p=>({value:p.id,label:`${p.id} — ${p.nome}`}))}/>
              <Inp label="Cor" value={item.cor} onChange={v=>setItem(i=>({...i,cor:v}))} placeholder="Ex: AZUL"/>
              <Sel label="Tamanho" value={item.tamanho} onChange={v=>setItem(i=>({...i,tamanho:v}))} options={TABS.map(t=>({value:t,label:t}))}/>
              <Inp label="Qtd." value={item.qtd} onChange={v=>setItem(i=>({...i,qtd:v}))} type="number" min="1"/>
              <Btn onClick={addItem} variant="success">+ Add</Btn>
            </div>
            {item.refId&&<div style={{marginTop:8,fontSize:11,color:C.muted}}>Cores cadastradas: <strong>{produtos.find(p=>p.id===item.refId)?.cor||"—"}</strong></div>}
          </div>
          {form.itens.length>0&&<div style={{marginBottom:14}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f1f5f9"}}>{["Ref.","Nome","Cor","Tam.","Qtd.","Subtotal",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",color:C.muted,fontWeight:700,fontSize:11}}>{h}</th>)}</tr></thead><tbody>{form.itens.map((it,i)=>{const p=produtos.find(x=>x.id===it.refId);return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 8px"}}><Badge>{it.refId}</Badge></td><td style={{padding:"6px 8px"}}>{p?.nome||"—"}</td><td style={{padding:"6px 8px",color:C.textS}}>{it.cor||"—"}</td><td style={{padding:"6px 8px"}}>{it.tamanho}</td><td style={{padding:"6px 8px",fontWeight:700}}>{it.qtd}</td><td style={{padding:"6px 8px",color:C.accent,fontWeight:700}}>{fmt((p?.venda||0)*it.qtd)}</td><td style={{padding:"6px 8px"}}><Btn onClick={()=>rmItem(i)} size="sm" variant="danger">✕</Btn></td></tr>);})}</tbody></table></div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn onClick={()=>setModal(null)} variant="ghost">Cancelar</Btn><Btn onClick={salvar} variant="success" disabled={saving}>{saving?"Salvando...":"💾 Salvar Pedido"}</Btn></div>
        </Modal>
      )}
      {detalhe&&(
        <Modal title={`Pedido ${detalhe.id} — ${detalhe.cliente}`} onClose={()=>setDetalhe(null)} wide>
          <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}><div style={{fontSize:13,color:C.muted}}>📅 {detalhe.data?.split("-").reverse().join("/")}</div><span style={{background:pgtoBg(detalhe.pagamento),color:pgtoColor(detalhe.pagamento),borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:700}}>{pgtoLabel(detalhe.pagamento)}</span></div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.navy,color:"#fff"}}><Th>Ref.</Th><Th>Produto</Th><Th>Cor</Th><Th center>Tam.</Th><Th center>Qtd.</Th><Th center>Unit.</Th><Th center>Lucro</Th><Th center>Total</Th></tr></thead><tbody>{detalhe.itens.map((it,i)=>{const p=produtos.find(x=>x.id===it.ref_id);return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#f8fafc"}}><Td><Badge>{it.ref_id}</Badge></Td><Td bold>{p?.nome||"—"}</Td><Td style={{fontSize:11,color:C.textS}}>{it.cor||p?.cor||"—"}</Td><Td center>{it.tamanho}</Td><Td center bold>{it.qtd}</Td><Td center>{fmt(p?.venda||0)}</Td><Td center bold color={C.green}>{fmt(((p?.venda||0)-(p?.custo||0))*it.qtd)}</Td><Td center bold color={C.accent}>{fmt((p?.venda||0)*it.qtd)}</Td></tr>);})}</tbody><tfoot>{(()=>{let v=0,c=0,q=0;detalhe.itens.forEach(it=>{const p=produtos.find(x=>x.id===it.ref_id);if(p){v+=p.venda*it.qtd;c+=p.custo*it.qtd;q+=it.qtd;}});return<tr style={{background:C.navy,color:"#fff"}}><td colSpan={4} style={{padding:"10px",fontWeight:800}}>TOTAL</td><td style={{padding:"10px",textAlign:"center",fontWeight:800}}>{q}</td><td></td><td style={{padding:"10px",textAlign:"center",color:"#86efac",fontWeight:800}}>{fmt(v-c)}</td><td style={{padding:"10px",textAlign:"center",fontWeight:800}}>{fmt(v)}</td></tr>;})()}</tfoot></table></div>
        </Modal>
      )}
    </div>
  );
}

function Compras({compras,produtos,carregar,showToast}){
  const [modal,setModal]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({fornecedor:"",data:tod(),itens:[]});
  const [item,setItem]=useState({refId:"",qtd:1,custoUnit:""});
  const addItem=()=>{if(!item.refId||!item.custoUnit||item.qtd<1)return alert("Preencha produto, qtd e custo.");setForm(f=>({...f,itens:[...f.itens,{...item,qtd:parseInt(item.qtd),custoUnit:parseFloat(item.custoUnit)}]}));setItem(i=>({...i,qtd:1,custoUnit:""}));};
  const salvar=async()=>{
    if(!form.fornecedor)return alert("Informe o fornecedor.");
    if(form.itens.length===0)return alert("Adicione pelo menos 1 item.");
    setSaving(true);
    try{
      const cmpId="CMP-"+uid().toUpperCase().slice(0,6);
      await sb("compras","POST",{id:cmpId,fornecedor:form.fornecedor,data:form.data});
      for(const it of form.itens){await sb("compra_itens","POST",{compra_id:cmpId,ref_id:it.refId,qtd:it.qtd,custo_unit:it.custoUnit});await sb(`produtos?id=eq.${it.refId}`,"PATCH",{custo:it.custoUnit});}
      await carregar(); showToast("Compra registrada!"); setModal(false);
    }catch(e){showToast(e.message,"erro");}
    setSaving(false);
  };
  const excluir=async id=>{if(!confirm("Excluir compra?"))return;try{await sb(`compras?id=eq.${id}`,"DELETE");await carregar();showToast("Compra excluída.");}catch(e){showToast(e.message,"erro");}};
  const tot=c=>c.itens.reduce((s,i)=>s+i.qtd*i.custoUnit,0);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{color:C.navy,margin:0,fontSize:18,fontWeight:800}}>Compras / Entradas ({compras.length})</h2>
        <Btn onClick={()=>{setForm({fornecedor:"",data:tod(),itens:[]});setItem({refId:produtos[0]?.id||"",qtd:1,custoUnit:""});setModal(true);}}>+ Nova Compra</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {compras.map(c=>(<Card key={c.id} style={{padding:"14px 18px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}><div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><Badge bg="#f0fdf4" color={C.green}>{c.id}</Badge><span style={{fontWeight:800,color:C.navy,fontSize:15}}>{c.fornecedor}</span></div><div style={{fontSize:12,color:C.muted}}>{c.data?.split("-").reverse().join("/")} · {c.itens.length} produto(s) · {c.itens.reduce((s,i)=>s+i.qtd,0)} peças</div></div><div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>Total Custo</div><div style={{fontWeight:800,color:C.gold,fontSize:16}}>{fmt(tot(c))}</div></div><Btn onClick={()=>setDetalhe(c)} size="sm" variant="ghost">👁 Ver</Btn><Btn onClick={()=>excluir(c.id)} size="sm" variant="danger">🗑️</Btn></div></div></Card>))}
        {compras.length===0&&<Card style={{textAlign:"center",color:C.muted,padding:40}}>Nenhuma compra registrada.</Card>}
      </div>
      {modal&&(<Modal title="Nova Compra / Entrada" onClose={()=>setModal(false)} wide><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}><div style={{gridColumn:"1/-1"}}><Inp label="Fornecedor / De quem comprou" value={form.fornecedor} onChange={v=>setForm(f=>({...f,fornecedor:v}))} placeholder="Nome do fornecedor"/></div><Inp label="Data da Compra" value={form.data} onChange={v=>setForm(f=>({...f,data:v}))} type="date"/></div><div style={{background:"#f8fafc",borderRadius:10,padding:14,marginBottom:14}}><div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:10,textTransform:"uppercase"}}>Adicionar Produto</div><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,alignItems:"flex-end"}}><Sel label="Produto" value={item.refId} onChange={v=>setItem(i=>({...i,refId:v}))} options={produtos.map(p=>({value:p.id,label:`${p.id} — ${p.nome}`}))}/><Inp label="Qtd." value={item.qtd} onChange={v=>setItem(i=>({...i,qtd:v}))} type="number" min="1"/><Inp label="Custo Unit. (R$)" value={item.custoUnit} onChange={v=>setItem(i=>({...i,custoUnit:v}))} type="number" min="0" placeholder="0,00"/><Btn onClick={addItem} variant="success">+ Add</Btn></div></div>{form.itens.length>0&&<table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:14}}><thead><tr style={{background:"#f1f5f9"}}>{["Ref.","Produto","Qtd.","Custo Unit.","Subtotal",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",color:C.muted,fontWeight:700,fontSize:11}}>{h}</th>)}</tr></thead><tbody>{form.itens.map((it,i)=>{const p=produtos.find(x=>x.id===it.refId);return<tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"6px 8px"}}><Badge>{it.refId}</Badge></td><td style={{padding:"6px 8px"}}>{p?.nome||"—"}</td><td style={{padding:"6px 8px",fontWeight:700}}>{it.qtd}</td><td style={{padding:"6px 8px"}}>{fmt(it.custoUnit)}</td><td style={{padding:"6px 8px",color:C.gold,fontWeight:700}}>{fmt(it.qtd*it.custoUnit)}</td><td style={{padding:"6px 8px"}}><Btn onClick={()=>setForm(f=>({...f,itens:f.itens.filter((_,j)=>j!==i)}))} size="sm" variant="danger">✕</Btn></td></tr>;})} </tbody></table>}<div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn onClick={()=>setModal(false)} variant="ghost">Cancelar</Btn><Btn onClick={salvar} variant="success" disabled={saving}>{saving?"Salvando...":"💾 Salvar Compra"}</Btn></div></Modal>)}
      {detalhe&&(<Modal title={`Compra ${detalhe.id} — ${detalhe.fornecedor}`} onClose={()=>setDetalhe(null)}><div style={{fontSize:13,color:C.muted,marginBottom:14}}>📅 {detalhe.data?.split("-").reverse().join("/")}</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:C.navy,color:"#fff"}}><Th>Ref.</Th><Th>Produto</Th><Th center>Qtd.</Th><Th center>Custo Unit.</Th><Th center>Total</Th></tr></thead><tbody>{detalhe.itens.map((it,i)=>{const p=produtos.find(x=>x.id===it.ref_id);return<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#f8fafc"}}><Td><Badge>{it.ref_id}</Badge></Td><Td bold>{p?.nome||"—"}</Td><Td center bold>{it.qtd}</Td><Td center>{fmt(it.custoUnit)}</Td><Td center bold color={C.gold}>{fmt(it.qtd*it.custoUnit)}</Td></tr>;})}</tbody></table></Modal>)}
    </div>
  );
}

function Categorias({categorias,produtos,carregar,showToast}){
  const [modal,setModal]=useState(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({id:"",nome:"",margem_min:""});
  const abrir=c=>{setForm(c?{...c,margem_min:String(c.margem_min)}:{id:"",nome:"",margem_min:""});setModal(c?"editar":"novo");};
  const salvar=async()=>{
    if(!form.nome||!form.margem_min)return alert("Preencha nome e margem.");
    setSaving(true);
    try{
      const item={id:form.id||uid(),nome:form.nome.trim(),margem_min:parseFloat(form.margem_min)||0};
      if(modal==="novo") await sb("categorias","POST",item);
      else await sb(`categorias?id=eq.${item.id}`,"PATCH",item);
      await carregar(); showToast("Categoria salva!"); setModal(null);
    }catch(e){showToast(e.message,"erro");}
    setSaving(false);
  };
  const excluir=async id=>{if(!confirm("Excluir categoria?"))return;try{await sb(`categorias?id=eq.${id}`,"DELETE");await carregar();showToast("Categoria excluída.");}catch(e){showToast(e.message,"erro");}};
  const qtd=nome=>produtos.filter(p=>p.categoria===nome).length;
  const sug=(custo,m)=>custo>0?custo/(1-m/100):0;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{color:C.navy,margin:0,fontSize:18,fontWeight:800}}>Categorias & Margens ({categorias.length})</h2>
        <Btn onClick={()=>abrir(null)}>+ Nova Categoria</Btn>
      </div>
      <div style={{background:"#eff6ff",border:`1px solid #bfdbfe`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.accent}}>
        💡 Defina a margem mínima por tipo de produto. O sistema sugere o preço de venda ideal ao cadastrar produtos.
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:C.navy,color:"#fff"}}><Th>Categoria</Th><Th center>Margem Mínima</Th><Th center>Produtos</Th><Th center>Custo R$50 → Venda</Th><Th center>Custo R$100 → Venda</Th><Th></Th></tr></thead>
          <tbody>{categorias.map((cat,i)=>(<tr key={cat.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#fafbfc"}}><td style={{padding:"11px 12px",fontWeight:700,color:C.navy}}>{cat.nome}</td><td style={{padding:"11px 12px",textAlign:"center"}}><span style={{background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"3px 12px",fontWeight:800,fontSize:13}}>{cat.margem_min}%</span></td><td style={{padding:"11px 12px",textAlign:"center",fontWeight:700}}>{qtd(cat.nome)}</td><td style={{padding:"11px 12px",textAlign:"center",color:C.accent,fontWeight:700}}>{fmt(sug(50,cat.margem_min))}</td><td style={{padding:"11px 12px",textAlign:"center",color:C.accent,fontWeight:700}}>{fmt(sug(100,cat.margem_min))}</td><td style={{padding:"11px 12px",textAlign:"right",whiteSpace:"nowrap"}}><Btn onClick={()=>abrir(cat)} size="sm" variant="ghost" style={{marginRight:6}}>✏️</Btn><Btn onClick={()=>excluir(cat.id)} size="sm" variant="danger">🗑️</Btn></td></tr>))}{categorias.length===0&&<tr><td colSpan={6} style={{padding:32,textAlign:"center",color:C.muted}}>Nenhuma categoria cadastrada.</td></tr>}</tbody>
        </table></div>
      </Card>
      {modal&&(<Modal title={modal==="novo"?"Nova Categoria":"Editar Categoria"} onClose={()=>setModal(null)}><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Nome da Categoria" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} placeholder="Ex: Camiseta, Calça..."/><Inp label="Margem Mínima de Lucro (%)" value={form.margem_min} onChange={v=>setForm(f=>({...f,margem_min:v}))} type="number" min="0" placeholder="Ex: 40"/></div>{form.margem_min&&<div style={{background:"#eff6ff",borderRadius:8,padding:"10px 14px",marginTop:14}}><div style={{fontSize:12,color:C.accent,fontWeight:700,marginBottom:6}}>📊 Simulação com margem de {form.margem_min}%:</div>{[30,50,80,100,150].map(custo=><div key={custo} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px dashed #bfdbfe`}}><span style={{color:C.muted}}>Custo {fmt(custo)}</span><span style={{color:C.accent,fontWeight:700}}>→ Venda {fmt(custo/(1-(parseFloat(form.margem_min)||0)/100))}</span></div>)}</div>}<div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}><Btn onClick={()=>setModal(null)} variant="ghost">Cancelar</Btn><Btn onClick={salvar} variant="success" disabled={saving}>{saving?"Salvando...":"💾 Salvar"}</Btn></div></Modal>)}
    </div>
  );
}

function Relatorio({pedidos,produtos,categorias}){
  const [periodo,setPeriodo]=useState("todos");
  const [grupo,setGrupo]=useState("produto");
  const agora=new Date();
  const filtrar=ped=>{if(periodo==="todos")return true;const d=new Date(ped.data);if(periodo==="mes")return d.getMonth()===agora.getMonth()&&d.getFullYear()===agora.getFullYear();if(periodo==="ano")return d.getFullYear()===agora.getFullYear();return true;};
  const peds=pedidos.filter(filtrar);
  const relProd=produtos.map(p=>{let q=0,v=0,c=0;peds.forEach(ped=>ped.itens.filter(i=>i.ref_id===p.id).forEach(i=>{q+=i.qtd;v+=p.venda*i.qtd;c+=p.custo*i.qtd;}));return{...p,qtd:q,venda:v,custo:c,lucro:v-c,margem:v>0?(v-c)/v*100:0};}).filter(p=>p.qtd>0).sort((a,b)=>b.lucro-a.lucro);
  const relCat=categorias.map(cat=>{const ps=produtos.filter(p=>p.categoria===cat.nome);let q=0,v=0,c=0;ps.forEach(p=>peds.forEach(ped=>ped.itens.filter(i=>i.ref_id===p.id).forEach(i=>{q+=i.qtd;v+=p.venda*i.qtd;c+=p.custo*i.qtd;})));return{...cat,qtd:q,venda:v,custo:c,lucro:v-c,margem:v>0?(v-c)/v*100:0};}).filter(c=>c.qtd>0).sort((a,b)=>b.lucro-a.lucro);
  const pr={};peds.forEach(ped=>{const k=ped.pagamento||"outros";if(!pr[k])pr[k]={qtd:0,pecas:0,venda:0,custo:0};pr[k].qtd++;ped.itens.forEach(it=>{const p=produtos.find(x=>x.id===it.ref_id);if(p){pr[k].venda+=p.venda*it.qtd;pr[k].custo+=p.custo*it.qtd;pr[k].pecas+=it.qtd;}});});
  const tv=relProd.reduce((s,r)=>s+r.venda,0),tc=relProd.reduce((s,r)=>s+r.custo,0),tl=relProd.reduce((s,r)=>s+r.lucro,0),tq=relProd.reduce((s,r)=>s+r.qtd,0);
  const rows=grupo==="produto"?relProd:relCat;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{color:C.navy,margin:0,fontSize:18,fontWeight:800}}>Relatório de Vendas</h2>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["todos","Todos"],["mes","Este Mês"],["ano","Este Ano"]].map(([v,l])=><button key={v} onClick={()=>setPeriodo(v)} style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${periodo===v?C.accent:C.border}`,background:periodo===v?C.accent:"#fff",color:periodo===v?"#fff":C.muted,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>{l}</button>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:22}}>{[{label:"Receita Total",value:fmt(tv),color:C.accent},{label:"Custo Total",value:fmt(tc),color:C.gold},{label:"Lucro Líquido",value:fmt(tl),color:C.green},{label:"Margem Geral",value:pct(tv>0?tl/tv*100:0),color:"#7c3aed"},{label:"Total Peças",value:tq,color:C.navy},{label:"Pedidos",value:peds.length,color:C.muted}].map(c=><Card key={c.label} style={{padding:"12px 16px"}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:.8}}>{c.label}</div><div style={{fontSize:22,fontWeight:900,color:c.color,marginTop:2}}>{c.value}</div></Card>)}</div>
      {Object.keys(pr).length>0&&<Card style={{marginBottom:20}}><div style={{fontWeight:800,color:C.navy,marginBottom:14,fontSize:13}}>💳 Por Forma de Pagamento</div><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{Object.entries(pr).map(([k,v])=><div key={k} style={{flex:"1 1 150px",background:pgtoBg(k),borderRadius:10,padding:"12px 16px"}}><div style={{fontWeight:700,color:pgtoColor(k),marginBottom:6,fontSize:12}}>{pgtoLabel(k)}</div><div style={{fontSize:18,fontWeight:900,color:pgtoColor(k)}}>{fmt(v.venda)}</div><div style={{fontSize:11,color:pgtoColor(k),opacity:.8}}>{v.qtd} pedido(s) · {v.pecas} peças</div><div style={{fontSize:11,color:pgtoColor(k),marginTop:4}}>Lucro: <strong>{fmt(v.venda-v.custo)}</strong></div></div>)}</div></Card>}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <span style={{fontWeight:800,color:C.navy}}>Detalhamento</span>
          <div style={{display:"flex",gap:6}}>{[["produto","Por Produto"],["categoria","Por Categoria"]].map(([v,l])=><button key={v} onClick={()=>setGrupo(v)} style={{padding:"5px 12px",borderRadius:6,border:`1.5px solid ${grupo===v?C.navy:C.border}`,background:grupo===v?C.navy:"#fff",color:grupo===v?"#fff":C.muted,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>{l}</button>)}</div>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:C.navy,color:"#fff"}}><Th>ID</Th><Th>Nome</Th><Th>Info</Th><Th center>Qtd.</Th><Th center>Custo</Th><Th center>Receita</Th><Th center>Lucro</Th><Th center>Margem</Th><Th center>% Receita</Th></tr></thead>
          <tbody>{rows.map((r,i)=><tr key={r.id||r.nome} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"#fff":"#f8fafc"}}><Td><Badge>{grupo==="produto"?r.id:r.nome}</Badge></Td><Td bold>{r.nome}</Td><Td style={{fontSize:11,color:C.muted}}>{grupo==="produto"?r.cor:`${produtos.filter(p=>p.categoria===r.nome).length} prod.`}</Td><Td center bold>{r.qtd}</Td><Td center color={C.muted}>{fmt(r.custo)}</Td><Td center bold color={C.accent}>{fmt(r.venda)}</Td><Td center bold color={C.green}>{fmt(r.lucro)}</Td><td style={{padding:"9px 10px",textAlign:"center"}}><span style={{background:r.margem>=40?C.greenL:r.margem>=20?C.goldL:C.redL,color:r.margem>=40?C.green:r.margem>=20?C.gold:C.red,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{pct(r.margem)}</span></td><td style={{padding:"9px 10px",textAlign:"center"}}><div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}><div style={{height:6,width:56,background:"#e2e8f0",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${tv>0?(r.venda/tv)*100:0}%`,background:C.accent,borderRadius:99}}/></div><span style={{fontSize:10,color:C.muted}}>{pct(tv>0?(r.venda/tv)*100:0)}</span></div></td></tr>)}{rows.length===0&&<tr><td colSpan={9} style={{padding:32,textAlign:"center",color:C.muted}}>Nenhum dado para o período.</td></tr>}</tbody>
          {rows.length>0&&<tfoot><tr style={{background:C.navy,color:"#fff"}}><td colSpan={3} style={{padding:"11px 10px",fontWeight:800}}>TOTAL GERAL</td><td style={{padding:"11px 10px",textAlign:"center",fontWeight:800}}>{tq}</td><td style={{padding:"11px 10px",textAlign:"center"}}>{fmt(tc)}</td><td style={{padding:"11px 10px",textAlign:"center",fontWeight:800}}>{fmt(tv)}</td><td style={{padding:"11px 10px",textAlign:"center",fontWeight:800,color:"#86efac"}}>{fmt(tl)}</td><td style={{padding:"11px 10px",textAlign:"center",fontWeight:800}}>{pct(tv>0?tl/tv*100:0)}</td><td></td></tr></tfoot>}
        </table></div>
      </Card>
    </div>
  );
}
