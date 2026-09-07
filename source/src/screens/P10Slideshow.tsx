import type { CommonProps } from "./types";
import type { Screen } from "../types";

interface Props extends CommonProps {
  p10SlideIdx: number;
  setP10SlideIdx: React.Dispatch<React.SetStateAction<number>>;
  P10_SLIDES: string[];
  backScreen?: Screen;
}

export function P10Slideshow({language,setLanguage,setScreen,reset,p10SlideIdx,setP10SlideIdx,P10_SLIDES,backScreen="blank1"}:Props){
  return(
    <main style={{background:"#000",display:"grid",gridTemplateRows:"auto 1fr auto",height:"100dvh",overflow:"hidden",position:"relative"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:"rgba(0,0,0,.85)",zIndex:10}}>
        <button className="brand brandButton" onClick={reset} style={{color:"#fff"}}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button>
        <span style={{color:"#c9e8dc",fontSize:"13px",fontWeight:700}}>{p10SlideIdx+1} / {P10_SLIDES.length}</span>
        <button className="langMini" onClick={()=>setScreen(backScreen)} style={{background:"transparent",border:"1px solid #39efb4",color:"#39efb4",borderRadius:"4px",padding:"4px 10px",cursor:"pointer"}}>✕ {language==="it"?"Chiudi":"Close"}</button>
      </header>
      <section style={{display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"#000",minHeight:0,position:"relative"}}>
        <img src={P10_SLIDES[p10SlideIdx]} alt={`Slide ${p10SlideIdx+1}`} style={{maxWidth:"100%",maxHeight:"100%",width:"100%",height:"100%",objectFit:"contain"}}/>
        {/* Freccia sinistra — overlay al centro del lato sx */}
        <button onClick={()=>setP10SlideIdx(i=>Math.max(0,i-1))} disabled={p10SlideIdx===0}
          style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,.45)",border:"none",cursor:p10SlideIdx===0?"not-allowed":"pointer",opacity:p10SlideIdx===0?0.2:1,padding:"18px 14px",borderRadius:"0 8px 8px 0",zIndex:20}}>
          <svg width="28" height="48" viewBox="0 0 36 54"><polygon points="34,2 2,27 34,52" fill="white"/></svg>
        </button>
        {/* Freccia destra — overlay al centro del lato dx */}
        <button onClick={()=>p10SlideIdx===P10_SLIDES.length-1?setScreen(backScreen):setP10SlideIdx(i=>i+1)}
          style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,.45)",border:"none",cursor:"pointer",padding:"18px 14px",borderRadius:"8px 0 0 8px",zIndex:20}}>
          <svg width="28" height="48" viewBox="0 0 36 54"><polygon points="2,2 34,27 2,52" fill="white"/></svg>
        </button>
      </section>
      <footer style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",padding:"10px 20px",background:"rgba(0,0,0,.85)"}}>
        {P10_SLIDES.map((_,i)=><span key={i} onClick={()=>setP10SlideIdx(i)} style={{width:"8px",height:"8px",borderRadius:"50%",background:i===p10SlideIdx?"#39efb4":"#3a6a58",border:i===p10SlideIdx?"none":"1px solid #39efb4",cursor:"pointer",display:"inline-block"}}/>)}
      </footer>
    </main>
  );
}
