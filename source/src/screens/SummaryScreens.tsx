import { useState } from "react";
import type { Priority, Outcome } from "../types";
import type { CommonProps, NeedItem } from "./types";
import { missionCatalog } from "../constants";

type NeedsByMission = [number, (NeedItem & { rank: number })[]][];

// Mappa missionIndex → area tematica
const MISSION_AREAS = {
  it: ["Data Foundation","Energia e Scope 1–2","Supply chain e Scope 3","ESG Reporting","Pianificazione Net Zero","Framework e disclosure"],
  en: ["Data Foundation","Energy & Scope 1–2","Supply chain & Scope 3","ESG Reporting","Net Zero Planning","Frameworks & disclosure"],
};

// Copertura attesa della soluzione per area (neutra, parametrizzata sull'esito)
const COVERAGE_LABEL: Record<string, Record<Outcome,{it:string,en:string}>> = {
  "0": {
    positive:{it:"Copertura completa: automazione, lineage e integrazioni",en:"Full coverage: automation, lineage and integrations"},
    warning: {it:"Copertura parziale: raccolta strutturata, qualità manuale",en:"Partial coverage: structured collection, manual quality"},
    critical:{it:"Copertura minima: processi attuali con supporto esterno",en:"Minimal coverage: current processes with external support"},
  },
  "1": {
    positive:{it:"Copertura completa: analytics energetica e anomaly detection",en:"Full coverage: energy analytics and anomaly detection"},
    warning: {it:"Copertura parziale: dashboard manuale con alert configurati",en:"Partial coverage: manual dashboard with configured alerts"},
    critical:{it:"Copertura minima: tracciamento consumi su foglio di calcolo",en:"Minimal coverage: consumption tracked on spreadsheet"},
  },
  "2": {
    positive:{it:"Copertura completa: portale fornitori e dati Scope 3 automatici",en:"Full coverage: supplier portal and automated Scope 3 data"},
    warning: {it:"Copertura parziale: raccolta fornitori con form strutturati",en:"Partial coverage: supplier collection via structured forms"},
    critical:{it:"Copertura minima: dati Scope 3 stimati senza piattaforma",en:"Minimal coverage: estimated Scope 3 data without platform"},
  },
  "3": {
    positive:{it:"Copertura completa: GHG reporting, workflow e multi-framework",en:"Full coverage: GHG reporting, workflows and multi-framework"},
    warning: {it:"Copertura parziale: reporting consolidato con revisione manuale",en:"Partial coverage: consolidated reporting with manual review"},
    critical:{it:"Copertura minima: reporting basato su export manuali",en:"Minimal coverage: reporting based on manual exports"},
  },
  "4": {
    positive:{it:"Copertura completa: scenari Net Zero e simulazioni d'investimento",en:"Full coverage: Net Zero scenarios and investment simulations"},
    warning: {it:"Copertura parziale: obiettivi definiti senza simulazione integrata",en:"Partial coverage: defined targets without integrated simulation"},
    critical:{it:"Copertura minima: pianificazione narrativa senza dati strutturati",en:"Minimal coverage: narrative planning without structured data"},
  },
  "5": {
    positive:{it:"Copertura completa: mappatura CSRD, GRI, SASB, CDP automatizzata",en:"Full coverage: automated CSRD, GRI, SASB, CDP mapping"},
    warning: {it:"Copertura parziale: mappatura manuale dei requisiti framework",en:"Partial coverage: manual requirements mapping"},
    critical:{it:"Copertura minima: disclosure basata su template non integrati",en:"Minimal coverage: disclosure based on non-integrated templates"},
  },
};

// Gap residui per area e esito
const GAP_LABEL: Record<string, Record<Outcome,{it:string,en:string}>> = {
  "0": {
    positive:{it:"Gap residuo: personalizzazione integrazioni custom e governance dati",en:"Residual gap: custom integration setup and data governance"},
    warning: {it:"Gap residuo: automazione raccolta e tracciabilità audit trail",en:"Residual gap: collection automation and audit trail traceability"},
    critical:{it:"Gap residuo: struttura dati, qualità, tracciabilità e scalabilità",en:"Residual gap: data structure, quality, traceability and scalability"},
  },
  "1": {
    positive:{it:"Gap residuo: integrazione con sistemi BMS/SCADA esistenti",en:"Residual gap: integration with existing BMS/SCADA systems"},
    warning: {it:"Gap residuo: automazione letture e drill-down anomalie",en:"Residual gap: reading automation and anomaly drill-down"},
    critical:{it:"Gap residuo: granularità consumi, benchmark e proiezioni",en:"Residual gap: consumption granularity, benchmarks and projections"},
  },
  "2": {
    positive:{it:"Gap residuo: onboarding fornitori tier-2 e validazione dati",en:"Residual gap: tier-2 supplier onboarding and data validation"},
    warning: {it:"Gap residuo: verifica dati fornitori e copertura Scope 3 completa",en:"Residual gap: supplier data verification and full Scope 3 coverage"},
    critical:{it:"Gap residuo: raccolta strutturata, verifica e tracciabilità fornitori",en:"Residual gap: structured collection, verification and supplier traceability"},
  },
  "3": {
    positive:{it:"Gap residuo: personalizzazione KPI e connettori ESG esterni",en:"Residual gap: KPI customization and external ESG connectors"},
    warning: {it:"Gap residuo: assurance-readiness e automazione workflow approvativi",en:"Residual gap: assurance-readiness and approval workflow automation"},
    critical:{it:"Gap residuo: consolidamento dati, workflow e audit trail",en:"Residual gap: data consolidation, workflows and audit trail"},
  },
  "4": {
    positive:{it:"Gap residuo: validazione scenari con dati storici verificati",en:"Residual gap: scenario validation with verified historical data"},
    warning: {it:"Gap residuo: collegamento obiettivi a dati operativi in real-time",en:"Residual gap: linking targets to real-time operational data"},
    critical:{it:"Gap residuo: baseline dati affidabile per scenari e simulazioni",en:"Residual gap: reliable data baseline for scenarios and simulations"},
  },
  "5": {
    positive:{it:"Gap residuo: aggiornamento continuo ai nuovi standard normativi",en:"Residual gap: continuous updates to new regulatory standards"},
    warning: {it:"Gap residuo: automazione mappatura e controllo requisiti ESRS",en:"Residual gap: automation of ESRS requirements mapping and control"},
    critical:{it:"Gap residuo: framework operativo integrato con i dati ESG",en:"Residual gap: operational framework integrated with ESG data"},
  },
};

// Prossimi approfondimenti per area e esito
const NEXT_STEPS: Record<string, Record<Outcome,{it:string,en:string}>> = {
  "0": {
    positive:{it:"Definire architettura integrazioni e piano di rollout multi-sede",en:"Define integration architecture and multi-site rollout plan"},
    warning: {it:"Valutare automazione raccolta dati e certificazione audit trail",en:"Assess data collection automation and audit trail certification"},
    critical:{it:"Avviare assessment data foundation e identificare quick win",en:"Start data foundation assessment and identify quick wins"},
  },
  "1": {
    positive:{it:"Connettere sistemi BMS/SCADA e configurare analytics avanzata",en:"Connect BMS/SCADA systems and configure advanced analytics"},
    warning: {it:"Implementare automazione letture e alerting intelligente",en:"Implement reading automation and intelligent alerting"},
    critical:{it:"Strutturare raccolta consumi e definire baseline energetica",en:"Structure consumption collection and define energy baseline"},
  },
  "2": {
    positive:{it:"Estendere portale fornitori ai tier-2 e automatizzare validazione",en:"Extend supplier portal to tier-2 and automate validation"},
    warning: {it:"Strutturare raccolta dati fornitori e avviare verifica campionaria",en:"Structure supplier data collection and start sample verification"},
    critical:{it:"Definire perimetro Scope 3 prioritario e selezionare metodo di calcolo",en:"Define priority Scope 3 boundary and select calculation method"},
  },
  "3": {
    positive:{it:"Configurare connettori ESG esterni e personalizzare dashboard KPI",en:"Configure external ESG connectors and customize KPI dashboards"},
    warning: {it:"Automatizzare workflow approvazione e prepararsi all'assurance",en:"Automate approval workflows and prepare for assurance"},
    critical:{it:"Unificare fonti dati e strutturare processo di consolidamento",en:"Unify data sources and structure consolidation process"},
  },
  "4": {
    positive:{it:"Validare scenari su baseline verificata e simulare piani d'investimento",en:"Validate scenarios on verified baseline and simulate investment plans"},
    warning: {it:"Collegare target Net Zero ai dati operativi e monitorare avanzamento",en:"Link Net Zero targets to operational data and monitor progress"},
    critical:{it:"Costruire baseline dati affidabile prima di avviare la pianificazione",en:"Build reliable data baseline before starting planning"},
  },
  "5": {
    positive:{it:"Monitorare aggiornamenti normativi e automatizzare gap analysis",en:"Monitor regulatory updates and automate gap analysis"},
    warning: {it:"Automatizzare mappatura ESRS e collegare KPI ai requisiti normativi",en:"Automate ESRS mapping and link KPIs to regulatory requirements"},
    critical:{it:"Scegliere framework prioritario e avviare mappatura manuale strutturata",en:"Select priority framework and start structured manual mapping"},
  },
};

interface SummaryProps extends CommonProps {
  priorities: Priority[];
  priorityIncluded: Record<Priority, boolean>;
  missionOrder: number[];
  missionOutcomes: Record<number, string>;
  needsByMissionHub: NeedsByMission;
  calculatedTrustScore: number;
  decisionLabel: (missionIndex: number, outcome: Outcome) => string;
  outcomeLabel: (missionIndex: number, outcome: Outcome) => string;
  needRelevance: Record<string, number>;
  needCriticality: Record<string, number>;
  needIdToCapability: Record<string, {it:string,en:string}>;
  companyName: string;
  t: Record<string, any>;
}

export function SummaryScreen({
  language, setLanguage, setScreen, reset, renderTrustBar,
  priorities, priorityIncluded, missionOrder, missionOutcomes, needsByMissionHub,
  calculatedTrustScore, decisionLabel, outcomeLabel,
  needRelevance, needCriticality, needIdToCapability,
  companyName, t,
}: SummaryProps) {
  const isIt = language === "it";
  const displayName = companyName.trim() || (isIt ? "La tua azienda" : "Your company");
  const areas = isIt ? MISSION_AREAS.it : MISSION_AREAS.en;
  const outcomeColor: Record<string,string> = {positive:"#39efb4", warning:"#f5c542", critical:"#ff6b6b"};

  // Sezioni per area tematica nell'ordine fisso delle 6 missioni
  const sections = [0,1,2,3,4,5].map(mi => {
    const m = missionCatalog[mi];
    const outcome = (missionOutcomes[mi] as Outcome) ?? null;
    const needs = needsByMissionHub.find(([x])=>x===mi)?.[1] ?? [];
    const topNeeds = mi === 0
      ? [{id:"__foundation__", label: isIt?"Una data foundation solida e tracciabile":"A solid and traceable data foundation", rank:0} as any, ...needs]
      : needs;
    // ordinati per rilevanza × criticità
    const sortedNeeds = [...topNeeds].sort((a,b)=>{
      const relA = needRelevance[a.id] ?? 5;
      const relB = needRelevance[b.id] ?? 5;
      const critA = needCriticality[a.id] ?? 5;
      const critB = needCriticality[b.id] ?? 5;
      return (relB * critB) - (relA * critA);
    });
    const coverage = outcome ? COVERAGE_LABEL[String(mi)]?.[outcome] : null;
    const gap = outcome ? GAP_LABEL[String(mi)]?.[outcome] : null;
    const next = outcome ? NEXT_STEPS[String(mi)]?.[outcome] : null;
    return { mi, m, outcome, sortedNeeds, coverage, gap, next };
  });

  return (
    <main className="summaryScreen summaryDoc">
      <header className="missionNav missionNavTrust">
        <button className="brand brandButton" onClick={reset}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button>
        <div className="missionProgress"><span className="activeDot"/> ESG ROADMAP</div>
        {renderTrustBar()}
        <button className="langMini" onClick={()=>setLanguage(language==="it"?"en":"it")}>{language==="it"?"EN":"IT"}</button>
      </header>

      <div className="summaryDocBody">
        {/* ── Intestazione documento ── */}
        <section className="summaryDocHeader">
          <p className="eyebrow">{isIt?"SINTESI CONSULENZIALE · ESG IMPACT QUEST":"ADVISORY SUMMARY · ESG IMPACT QUEST"}</p>
          <h1 className="summaryDocTitle">{displayName} — {isIt?"Piano ESG operativo":"ESG operational plan"}</h1>
          <div className="summaryDocMeta">
            <span>{isIt?"Obiettivi prioritari":"Priority objectives"}: <strong>{priorities.filter(p=>priorityIncluded[p]).slice(0,3).map(p=>t.priorityNames?.[p]??p).join(" · ")}</strong></span>
            <span>{isIt?"Profondità analisi":"Analysis depth"}: <strong style={{color: calculatedTrustScore>=70?"#39efb4":calculatedTrustScore>=40?"#f5c542":"#ff6b6b"}}>{calculatedTrustScore}/100</strong></span>
          </div>
          <p className="trustDisclaimer" style={{marginTop:"6px"}}>{isIt?"ⓘ Il punteggio misura la completezza dell'analisi svolta, non una preferenza tecnologica.":"ⓘ The score reflects analysis completeness, not a technology preference."}</p>
        </section>

        {/* ── Sezioni per area tematica ── */}
        {sections.map(({mi, m, outcome, sortedNeeds, coverage, gap, next})=>(
          <SummaryAreaSection
            key={mi}
            position={mi}
            areaLabel={areas[mi]}
            missionLabel={isIt ? m.it : m.en}
            outcome={outcome}
            sortedNeeds={sortedNeeds}
            coverage={coverage}
            gap={gap}
            next={next}
            decisionLabel={outcome ? decisionLabel(mi, outcome) : null}
            outcomeLabel_={outcome ? outcomeLabel(mi, outcome) : null}
            needRelevance={needRelevance}
            needCriticality={needCriticality}
            needIdToCapability={needIdToCapability}
            isIt={isIt}
            outcomeColor={outcomeColor}
          />
        ))}

        {/* ── Envizi — solo dopo aver presentato tutti i gap ── */}
        <section className="summaryEnviziSection">
          <p className="summaryEnviziKicker">{isIt?"COPERTURA TECNOLOGICA · IBM ENVIZI ESG SUITE":"TECHNOLOGY COVERAGE · IBM ENVIZI ESG SUITE"}</p>
          <p className="summaryEnviziBody">
            {isIt
              ? `Sulla base dell'analisi condotta con ${displayName}, IBM Envizi ESG Suite risponde ai requisiti identificati nelle aree Data Foundation, Energia e Scope 1–2, Supply Chain e Scope 3, ESG Reporting, Pianificazione Net Zero e Framework ESG. La scelta del modulo e del livello di implementazione dipende dal gap residuo identificato per ciascuna area e dalla capacità organizzativa di assorbire il cambiamento.`
              : `Based on the analysis carried out with ${displayName}, IBM Envizi ESG Suite addresses the requirements identified across Data Foundation, Energy & Scope 1–2, Supply Chain & Scope 3, ESG Reporting, Net Zero Planning and ESG Frameworks. The choice of module and implementation level depends on the residual gap identified for each area and the organisation's change absorption capacity.`}
          </p>
          <p className="trustDisclaimer">{isIt?"La presentazione di IBM Envizi segue — e non precede — la definizione dei requisiti, della copertura attesa e dei gap residui di ciascuna area.":"IBM Envizi is presented after — not before — the definition of requirements, expected coverage and residual gaps for each area."}</p>
        </section>
      </div>

      <footer className="summaryActions">
        <button className="secondaryAction" onClick={reset}>← {t.backStart}</button>
        <button className="actionButton" onClick={()=>setScreen("nextStep")}>{t.nextStep}<b>→</b></button>
      </footer>
    </main>
  );
}

// ── Sotto-componente per ogni area tematica ──────────────────────────────────
interface AreaSectionProps {
  position: number;
  areaLabel: string;
  missionLabel: string;
  outcome: Outcome | null;
  sortedNeeds: any[];
  coverage: {it:string,en:string} | null;
  gap: {it:string,en:string} | null;
  next: {it:string,en:string} | null;
  decisionLabel: string | null;
  outcomeLabel_: string | null;
  needRelevance: Record<string,number>;
  needCriticality: Record<string,number>;
  needIdToCapability: Record<string,{it:string,en:string}>;
  isIt: boolean;
  outcomeColor: Record<string,string>;
}

function SummaryAreaSection({
  position, areaLabel, missionLabel, outcome, sortedNeeds,
  coverage, gap, next, decisionLabel, outcomeLabel_,
  needRelevance, needCriticality, needIdToCapability,
  isIt, outcomeColor,
}: AreaSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const SHOW_N = 5;
  const hasMore = sortedNeeds.length > SHOW_N;
  const visibleNeeds = showAll ? sortedNeeds : sortedNeeds.slice(0, SHOW_N);
  const oColor = outcome ? (outcomeColor[outcome] ?? "#7a9a90") : "#7a9a90";

  return (
    <section className="summaryAreaSection">
      <div className="summaryAreaHeader">
        <span className="summaryAreaNum">{String(position+1).padStart(2,"0")}</span>
        <div>
          <small className="summaryAreaTag">{areaLabel}</small>
          <h2 className="summaryAreaTitle">{missionLabel}</h2>
        </div>
        {outcome && (
          <span className="summaryAreaOutcomeBadge" style={{color:oColor, borderColor:oColor}}>
            {decisionLabel}
          </span>
        )}
      </div>

      <div className="summaryAreaGrid">
        {/* Esigenze prioritarie */}
        <div className="summaryAreaCol">
          <small className="summaryAreaColLabel">{isIt?"ESIGENZE PRIORITARIE":"PRIORITY NEEDS"}</small>
          {sortedNeeds.length === 0
            ? <p className="summaryAreaEmpty">{isIt?"Nessuna esigenza associata":"No associated needs"}</p>
            : <>
                {visibleNeeds.map((n,i)=>{
                  const rel = needRelevance[n.id] ?? 5;
                  const crit = needCriticality[n.id] ?? 5;
                  const cap = needIdToCapability[n.id];
                  const tier = rel>=8&&crit>=8?"#ff4d4d":rel>=5||crit>=5?"#7dd3fc":"#9ca3af";
                  return (
                    <div key={n.id} className="summaryNeedRow">
                      <span className="summaryNeedDot" style={{background:tier}}/>
                      <div>
                        <p className="summaryNeedLabel">{n.label}</p>
                        {cap && <p className="summaryNeedCap" style={{color:tier,opacity:.8}}>{isIt?cap.it:cap.en}</p>}
                      </div>
                    </div>
                  );
                })}
                {hasMore && !showAll && (
                  <button className="summaryShowAllBtn" onClick={()=>setShowAll(true)}>
                    {isIt?`Mostra tutti (${sortedNeeds.length})`:`Show all (${sortedNeeds.length})`}
                  </button>
                )}
              </>
          }
        </div>

        {/* AS-IS → Gap → Copertura → Beneficio */}
        <div className="summaryAreaCol">
          {outcome ? (
            <>
              <div className="summaryChainRow">
                <small className="summaryAreaColLabel">{isIt?"COPERTURA ATTESA":"EXPECTED COVERAGE"}</small>
                <p className="summaryChainText" style={{color:oColor}}>{isIt ? coverage?.it : coverage?.en}</p>
              </div>
              <div className="summaryChainRow">
                <small className="summaryAreaColLabel">{isIt?"GAP RESIDUO":"RESIDUAL GAP"}</small>
                <p className="summaryChainText">{isIt ? gap?.it : gap?.en}</p>
              </div>
              <div className="summaryChainRow">
                <small className="summaryAreaColLabel">{isIt?"IMPATTO ATTESO":"EXPECTED IMPACT"}</small>
                <p className="summaryChainText">{outcomeLabel_}</p>
              </div>
              <div className="summaryChainRow">
                <small className="summaryAreaColLabel">{isIt?"PROSSIMO APPROFONDIMENTO":"NEXT STEP"}</small>
                <p className="summaryChainText" style={{color:"rgba(57,239,180,.8)"}}>{isIt ? next?.it : next?.en}</p>
              </div>
            </>
          ) : (
            <p className="summaryAreaEmpty">{isIt?"Missione non ancora svolta":"Mission not yet completed"}</p>
          )}
        </div>
      </div>
    </section>
  );
}

interface NextStepProps extends CommonProps {
  priorities: Priority[];
  missionOrder: number[];
  missionOutcomes: Record<number, string>;
  missionParameters: Record<number, string[]>;
  trustScore: number;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  approachBiz: string;
  approachData: string;
  decisionLabel: (missionIndex: number, outcome: Outcome) => string;
  missionItems: (missionIndex: number) => { title: string; detail: string; metric: string }[];
  missionUnits: (missionIndex: number) => string[];
  renderSaveBtn: (isIt: boolean) => JSX.Element;
  t: Record<string, any>;
  name: string;
  profile: import("../types").Profile;
}

export function NextStepScreen({
  language, setLanguage, setScreen, reset, renderTrustBar,
  priorities, missionOrder, missionOutcomes, missionParameters, trustScore,
  contactEmail, setContactEmail, approachBiz, approachData,
  decisionLabel, missionItems, missionUnits, renderSaveBtn, t, name, profile,
}: NextStepProps) {
  const isIt = language === "it";
  const top3 = priorities.slice(0,3).map((p,i)=>`${i+1}. ${t.priorityNames[p]}`).join(", ");
  const decisionsLine = missionOrder.map(mi=>{const o=missionOutcomes[mi];return o?`M${mi+1}: ${decisionLabel(mi,o as Outcome)}`:`M${mi+1}: —`;}).join(" | ");
  const paramsLine = missionOrder.map(mi=>{const vals=missionParameters[mi]||[];const items=missionItems(mi);const units=missionUnits(mi);const filled=items.map((item,i)=>vals[i]?`${item.title}: ${vals[i]} ${units[i]}`:"").filter(Boolean);return filled.length?`[M${mi+1}: ${filled.join(", ")}]`:"";}).filter(Boolean).join(" ");
  const toEmail = contactEmail.trim() || t.nextContactEmail;
  const subj = isIt?"Demo IBM Envizi — Envizi Impact Quest":"IBM Envizi Demo — Envizi Impact Quest";
  const pocSubj = isIt?"Proof of Concept IBM Envizi — Envizi Impact Quest":"IBM Envizi PoC — Envizi Impact Quest";
  const bvaSubj = isIt?"Business Value Assessment IBM Envizi — Envizi Impact Quest":"IBM Envizi BVA — Envizi Impact Quest";
  const commonBody = isIt
    ?`%0A%0A— Profilo: ${name} (${profile==="marco"?t.maleRole:t.femaleRole})%0A— Punteggio fiducia finale: ${trustScore}/100%0A— Top 3 priorità: ${top3}%0A— Decisioni: ${decisionsLine}${paramsLine?`%0A— Parametri AS-IS: ${paramsLine}`:""}${approachBiz?`%0A— Esigenze di business: ${approachBiz}`:""}${approachData?`%0A— Sfide sui dati: ${approachData}`:""}%0A%0AIn attesa di un riscontro.`
    :`%0A%0A— Profile: ${name} (${profile==="marco"?t.maleRole:t.femaleRole})%0A— Final trust score: ${trustScore}/100%0A— Top 3 priorities: ${top3}%0A— Decisions: ${decisionsLine}${paramsLine?`%0A— AS-IS parameters: ${paramsLine}`:""}${approachBiz?`%0A— Business needs: ${approachBiz}`:""}${approachData?`%0A— Data challenges: ${approachData}`:""}%0A%0ALooking forward to your reply.`;
  const demoBody = isIt
    ?`Ciao,%0A%0AHo completato l'Envizi Impact Quest e vorrei approfondire come IBM Envizi si integra nel nostro contesto con una demo.${commonBody}`
    :`Hi,%0A%0AI have completed the Envizi Impact Quest and would like to explore how IBM Envizi fits our context with a demo.${commonBody}`;
  const pocBody = isIt
    ?`Ciao,%0A%0AHo completato l'Envizi Impact Quest e sono interessato a un Proof of Concept con i dati reali della mia organizzazione.${commonBody}`
    :`Hi,%0A%0AI have completed the Envizi Impact Quest and I am interested in a Proof of Concept with my organisation's real data.${commonBody}`;
  const bvaBody = isIt
    ?`Ciao,%0A%0AHo completato l'Envizi Impact Quest e vorrei richiedere un Business Value Assessment per quantificare il valore di IBM Envizi per la mia organizzazione.${commonBody}`
    :`Hi,%0A%0AI have completed the Envizi Impact Quest and would like to request a Business Value Assessment to quantify the value of IBM Envizi for my organisation.${commonBody}`;
  return <main className="nextStepScreen">
    <header className="missionNav missionNavTrust"><button className="brand brandButton" onClick={reset}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button><div className="missionProgress"><span className="activeDot"/> NEXT STEP</div>{renderTrustBar()}<button className="langMini" onClick={()=>setLanguage(language==="it"?"en":"it")}>{language==="it"?"EN":"IT"}</button></header>
    <section className="nextStepBody">
      <p className="eyebrow">{t.nextKicker}</p>
      <h1>{t.nextTitle}</h1>
      <div className="nextStepCards">
        <div className="nextStepCard nextStepCardDemo">
          <small>{t.nextDemoLabel}</small>
          <p>{t.nextDemoIntro}</p>
          <div className="nextDemoEmailRow"><input className="nextDemoEmailInput" type="email" placeholder={t.nextDemoEmailPlaceholder} value={contactEmail} onChange={e=>setContactEmail(e.target.value)}/></div>
          <a className="nextStepBtn primary" href={`mailto:${toEmail}?subject=${subj}&body=${demoBody}`}>{t.nextDemoButton}</a>
          {!contactEmail.trim()&&<a className="nextDemoFallbackLink" href={`mailto:${t.nextContactEmail}?subject=${subj}&body=${demoBody}`}>{t.nextDemoFallback}</a>}
        </div>
        <div className="nextStepCard"><small>{t.nextPocLabel}</small><p>{t.nextPocIntro}</p><a className="nextStepBtn primary" href={`mailto:${toEmail||t.nextContactEmail}?subject=${pocSubj}&body=${pocBody}`}>{t.nextPocButton}</a></div>
        <div className="nextStepCard"><small>{t.nextBvaLabel}</small><p>{t.nextBvaIntro}</p><a className="nextStepBtn primary" href={`mailto:${toEmail||t.nextContactEmail}?subject=${bvaSubj}&body=${bvaBody}`}>{t.nextBvaButton}</a></div>
        <div className="nextStepCard"><small>{t.nextSiteLabel}</small><p>{t.nextSiteIntro}</p><a className="nextStepBtn primary" href="https://www.ibm.com/it-it/products/envizi" target="_blank" rel="noreferrer">{t.nextSiteButton}</a></div>
      </div>
      <div className="nextStepContact"><small>{t.nextContactLabel}</small><strong>{t.nextContactName}</strong><span>{t.nextContactRole}</span><a href={`mailto:${t.nextContactEmail}`}>{t.nextContactEmail}</a></div>
      <div className="nextStepActions">
        <button className="secondaryAction" onClick={reset}>← {t.backStart}</button>
        <button className="actionButton" onClick={()=>setScreen("thankYou")}>{t.nextStep}<b>→</b></button>
      </div>
    </section>
  </main>;
}

interface ThankYouProps extends CommonProps {
  t: Record<string, any>;
}

export function ThankYouScreen({ language, setLanguage, reset, goBack, renderTrustBar, t }: ThankYouProps) {
  return <main className="thankYouScreen">
    <header className="missionNav"><button className="brand brandButton" onClick={reset}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button><div className="missionProgress"><span className="activeDot"/> FINAL</div><div className="introNavRight"><button className="introBackBtn" onClick={()=>goBack()}>← {language==="it"?"Indietro":"Back"}</button><button className="langMini" onClick={()=>setLanguage(language==="it"?"en":"it")}>{language==="it"?"EN":"IT"}</button></div></header>
    <section className="thankYouBody"><h1>{t.thankYouTitle}</h1></section>
  </main>;
}

interface MilestoneProps extends CommonProps {
  missionOutcomes: Record<number, string>;
  renderSaveBtn: (isIt: boolean) => JSX.Element;
  name: string;
}

export function MilestoneScreen({ language, profile, setLanguage, setScreen, reset, goBack, renderTrustBar, missionOutcomes, renderSaveBtn, name }: MilestoneProps) {
  const isTrusted = missionOutcomes[0] === "positive";
  const isIt = language === "it";
  const milestoneText = isTrusted
    ? (isIt ? "Complimenti, hai sbloccato il livello Trusted ESG Data Manager." : "Congratulations, you have unlocked the Trusted ESG Data Manager level.")
    : (isIt ? "Avviare la digitalizzazione dell\u2019ESG in modo semplice, con moduli per la raccolta dati e senza integrazione delle fonti, pu\u00f2 essere un\u2019ottima decisione per contenere costi e rischi iniziali. Anche in questo contesto IBM Envizi pu\u00f2 diventare fattore critico di successo per la tua iniziativa. Verifica quali requisiti della gestione dati sono comunque importanti per te e il valore di Envizi a supporto." : "Starting ESG digitalisation simply, with data collection forms and without source integration, can be an excellent decision to contain initial costs and risks. Even in this context, IBM Envizi can become a critical success factor for your initiative. Check which data management requirements are still important to you and the value Envizi can provide.");
  return (
    <main className="thankYouScreen">
      <header className="missionNav">
        <button className="brand brandButton" onClick={reset}><span className="brandMark">e·</span><span>Envizi<br/>Impact Quest</span></button>
        <div className="missionProgress"><span className="activeDot"/> MILESTONE</div>
        <button className="langMini" onClick={()=>setLanguage(language==="it"?"en":"it")}>{language==="it"?"EN":"IT"}</button>
      </header>
      <section className="thankYouBody" style={{display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"center",gap:"0",padding:"0",overflow:"hidden"}}>
        <div style={{height:"100%",overflow:"hidden"}}>
          <img src={`./characters/${profile}-${isTrusted?"success":"neutral"}.png`} alt={name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}}/>
        </div>
        <div style={{padding:"3vw 4vw",display:"flex",flexDirection:"column",gap:"16px"}}>
          <h1 style={{color:isTrusted?"#39efb4":"#ffc07c",fontSize:isTrusted?"clamp(24px,3vw,44px)":"clamp(28px,3vw,40px)",lineHeight:1.5,letterSpacing:"-.02em",margin:0}}>
            {milestoneText}
          </h1>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
            <button className="secondaryAction" onClick={()=>goBack()}>{isIt?"\u2190 Indietro":"\u2190 Back"}</button>
            <button className="actionButton" style={{width:"auto",marginTop:0,padding:"12px 16px"}} onClick={()=>setScreen("asis")}>{isIt?"Approfondiamo perch\u00e9 Envizi \u2192":"Let\u2019s explore why Envizi \u2192"}</button>
          </div>
          {renderSaveBtn(isIt)}
        </div>
      </section>
    </main>
  );
}
