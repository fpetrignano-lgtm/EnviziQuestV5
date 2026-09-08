import type { Outcome } from "../types";
import type { CommonProps } from "./types";

interface ActiveScenario {
  optionA: string;
  optionADetail: string;
  optionATag?: string;
  optionB: string;
  optionBDetail: string;
  optionC: string;
  optionCDetail: string;
  asIsItems: {title:string;detail:string;metric:string}[];
}

interface Props extends CommonProps {
  selectedMission: number;
  active: ActiveScenario;
  asIsRatings: Record<number, ("alto"|"medio"|"basso")[]>;
  setScreenHistory: React.Dispatch<React.SetStateAction<any[]>>;
  setScreenState: (s: any) => void;
  handleDecision: (outcome: Outcome) => void;
  t: Record<string, any>;
}

const MISSION_IMGS = {
  positive:["./envizi-data-automation.png","./energy-envizi-analytics.png","./supply-chain-envizi.png","./reporting-envizi.png","./planning-envizi.png","./framework-envizi.png"],
  warning:["./envizi-manual-forms.png","./energy-manual-dashboard.png","./supply-chain-portal.png","./reporting-intermediate.png","./planning-intermediate.png","./framework-intermediate.png"],
  critical:["./envizi-spreadsheets-email.png","./energy-asis-fragmented.png","./supply-chain-asis.png","./reporting-asis.png","./planning-asis.png","./framework-asis.png"],
};

// Copertura tecnologica separata — mostrata dopo le alternative decisionali
const TECH_COVERAGE = {
  it: [
    { key: "critical" as Outcome, tag: "Servizio Gestito",  detail: "Sperimenta con un nostro partner la gestione dei dati ESG." },
    { key: "warning"  as Outcome, tag: "Modulo Base",       detail: "Semplicità e velocità pronti per evolvere con i tuoi bisogni." },
    { key: "positive" as Outcome, tag: "Modulo Avanzato",   detail: "Automazione e affidabilità: Data Foundation con Connettori integrati." },
  ],
  en: [
    { key: "critical" as Outcome, tag: "Managed Service",   detail: "Experience ESG data management with one of our partners." },
    { key: "warning"  as Outcome, tag: "Base Module",       detail: "Simplicity and speed, ready to evolve with your needs." },
    { key: "positive" as Outcome, tag: "Advanced Module",   detail: "Automation and reliability: Data Foundation with integrated Connectors." },
  ],
};

// Punteggi 1-5 per le 6 dimensioni: [critical, warning, positive]
// Dimensioni: copertura funzionale, facilità implementazione, qualità/tracciabilità, scalabilità, integrazione, TCO
const DIM_SCORES: Record<string, [number,number,number][]> = {
  // missione 0 — Data Foundation
  "0": [[1,3,5],[5,3,2],[1,3,5],[1,3,5],[1,3,5],[5,3,2]],
  // missione 1 — Energy
  "1": [[1,3,5],[4,3,2],[1,3,5],[1,3,5],[1,3,5],[5,3,2]],
  // missione 2 — Supply Chain
  "2": [[1,3,5],[4,3,2],[1,3,5],[1,3,5],[1,3,5],[5,3,2]],
  // missione 3 — Reporting
  "3": [[1,3,5],[4,3,2],[1,3,5],[1,3,5],[2,3,5],[5,3,2]],
  // missione 4 — Planning
  "4": [[1,3,5],[4,3,2],[1,3,5],[2,3,5],[1,3,5],[5,3,2]],
  // missione 5 — Framework
  "5": [[1,3,5],[4,3,2],[1,3,5],[1,3,5],[2,3,5],[5,3,2]],
};

const DIMS = {
  it: ["Copertura funzionale","Facilità di implementazione","Qualità e tracciabilità","Scalabilità","Integrazione","Costo totale (TCO)"],
  en: ["Functional coverage","Ease of implementation","Quality & traceability","Scalability","Integration","Total cost (TCO)"],
};

// Dot visual: filled dots on a scale 1-5
function ScaleDots({value, color}:{value:number; color:string}){
  return (
    <span style={{display:"inline-flex",gap:"3px",alignItems:"center"}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{
          width:"10px",height:"10px",borderRadius:"50%",display:"inline-block",
          background: i<=value ? color : "rgba(255,255,255,.12)",
          border: `1px solid ${i<=value ? color : "rgba(255,255,255,.15)"}`,
        }}/>
      ))}
    </span>
  );
}

export function Compare({
  language,setLanguage,reset,
  selectedMission,active,asIsRatings,setScreenHistory,setScreenState,handleDecision,t,
}:Props){
  const m0=selectedMission===0;
  const isIt=language==="it";
  const options=[
    {key:"critical" as Outcome,title:active.optionC,detail:active.optionCDetail,img:MISSION_IMGS.critical[selectedMission]},
    {key:"warning"  as Outcome,title:active.optionB,detail:active.optionBDetail,img:MISSION_IMGS.warning[selectedMission]},
    {key:"positive" as Outcome,title:active.optionA,tag:(active as any).optionATag as string|undefined,detail:active.optionADetail,img:MISSION_IMGS.positive[selectedMission]},
  ];
  const techCoverage = isIt ? TECH_COVERAGE.it : TECH_COVERAGE.en;
  const dimLabels = isIt ? DIMS.it : DIMS.en;
  const scores = DIM_SCORES[String(selectedMission)] ?? DIM_SCORES["0"];
  // col order: [critical=0, warning=1, positive=2]
  const colColors: Record<Outcome,string> = {critical:"#ff6b6b", warning:"#f5c542", positive:"#39efb4"};
  const currentRatings=asIsRatings[selectedMission]||(active.asIsItems.map(()=>"alto" as "alto"|"medio"|"basso"));
  const ratingVal={"alto":25,"medio":12,"basso":0};
  const totalCrit=currentRatings.reduce((s,r)=>s+ratingVal[r],0);
  const critLevel=totalCrit<=25?"bassa":totalCrit<=50?"media":"alta";
  const critColor=critLevel==="alta"?"#ff6b6b":critLevel==="media"?"#f5c542":"#39efb4";
  const critLabel=isIt
    ?{alta:"CRITICITÀ ALTA",media:"CRITICITÀ MEDIA",bassa:"CRITICITÀ BASSA"}
    :{alta:"HIGH CRITICALITY",media:"MEDIUM CRITICALITY",bassa:"LOW CRITICALITY"};
  const critOnCard={"alta":"positive","media":"warning","bassa":"critical"} as Record<string,string>;

  const tagColor = (key: Outcome) => colColors[key];

  return(
    <main className="compareScreen">
      <header className="missionNav">
        <button className="brand brandButton" onClick={reset}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button>
        <div className="missionProgress"><span className="activeDot"/> {t.mission} <b>{String(selectedMission+1).padStart(2,"0")}</b><i>/</i>06</div>
        <div className="introNavRight">
          <button className="langMini" onClick={()=>setLanguage(language==="it"?"en":"it")}>{language==="it"?"EN":"IT"}</button>
        </div>
      </header>
      <section className="compareBody">
        <h1>{isIt?"Scegli la strada":"Choose your path"}</h1>
        <p className="compareHint">{isIt?"Seleziona un'immagine per fare la tua scelta e proseguire.":"Select an image to make your choice and continue."}</p>
        {/* Griglia decisionale — nessun riferimento a pacchetti */}
        <div className="compareGrid">
          {options.map(opt=>(
            <div key={opt.key} className="compareCardWrap">
              <article className={`compareCard ${opt.key}`} onClick={()=>handleDecision(opt.key)}>
                <div className="compareSolution">
                  <strong>{opt.title}</strong>
                  {opt.key==="positive"&&(opt as any).tag&&<span className="compareSolutionTag">{(opt as any).tag}</span>}
                </div>
                <div className="compareImg">
                  <img src={opt.img} alt={opt.title}/>
                  <div className="compareImgOverlay"><span>{isIt?"Scegli →":"Select →"}</span></div>
                </div>
                <div className="compareRowTop">
                  <p className="compareDetail">{opt.detail}</p>
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* Tabella valutazione 6 dimensioni */}
        <div className="compareDimSection">
          <small className="compareDimLabel">{isIt?"VALUTAZIONE · 6 DIMENSIONI":"EVALUATION · 6 DIMENSIONS"}</small>
          <table className="compareDimTable">
            <thead>
              <tr>
                <th className="compareDimThDim">{isIt?"Dimensione":"Dimension"}</th>
                {options.map(opt=>(
                  <th key={opt.key} className="compareDimThAlt" style={{color:colColors[opt.key]}}>
                    {opt.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dimLabels.map((dim,di)=>(
                <tr key={dim} className="compareDimRow">
                  <td className="compareDimCell compareDimCellLabel">{dim}</td>
                  {options.map((opt,oi)=>{
                    const colIdx = opt.key==="critical"?0:opt.key==="warning"?1:2;
                    const val = scores[di]?.[colIdx] ?? 1;
                    return(
                      <td key={opt.key} className="compareDimCell compareDimCellDots">
                        <ScaleDots value={val} color={colColors[opt.key]}/>
                        <span className="compareDimScore" style={{color:colColors[opt.key]}}>{val}/5</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sezione copertura tecnologica — visibile solo per Data Foundation */}
        {m0&&(
          <div className="compareTechSection">
            <small className="compareTechLabel">{isIt?"COPERTURA TECNOLOGICA · IBM ENVIZI":"TECHNOLOGY COVERAGE · IBM ENVIZI"}</small>
            <div className="compareTechRow">
              {techCoverage.map(tc=>(
                <div key={tc.key} className="compareTechItem">
                  <span className="compareTechTag" style={{color:tagColor(tc.key),borderColor:tagColor(tc.key)}}>{tc.tag}</span>
                  <p className="compareTechDetail">{tc.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <button className="secondaryAction" style={{position:"fixed",bottom:"24px",left:"24px",zIndex:9998}} onClick={()=>{setScreenHistory((h:any[])=>h.filter((s:any)=>s!=="compare"));setScreenState("asis");}}>← {isIt?"Indietro":"Back"}</button>
    </main>
  );
}
