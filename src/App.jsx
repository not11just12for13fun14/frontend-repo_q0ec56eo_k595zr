import { useState } from 'react'

function App() {
  const [form, setForm] = useState({
    student_class: 6,
    subject: 'Math',
    question: '',
    needs: ['explanation','steps','examples','practice','summary','tips','fun_facts','related']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [view, setView] = useState('study') // 'study' | 'outline'

  // Backend URL strategy:
  // 1) Use VITE_BACKEND_URL if provided (best for separate domains)
  // 2) Fallback to same-host port 8000 so it works across any domain/host
  const derivedBase = `${window.location.protocol}//${window.location.hostname}:8000`
  const baseUrl = (import.meta.env.VITE_BACKEND_URL || derivedBase).replace(/\/$/, '')

  const askAssistant = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setResult(data)
      setView('study')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const Section = ({ title, content }) => (
    <div className="bg-white/80 border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc ml-6 space-y-1 text-gray-700 text-sm">
          {content.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 text-sm">{String(content)}</p>
      )}
    </div>
  )

  const buildOutline = (data) => {
    if (!data) return []
    const byTitle = {}
    ;(data.sections || []).forEach(s => { byTitle[s.title] = s.content })

    const title = data.topic || 'Lesson'
    const keyIdeas = []
    if (byTitle['Quick Summary']) keyIdeas.push(...byTitle['Quick Summary'])
    if (byTitle['Helpful Tips']) keyIdeas.push(...byTitle['Helpful Tips'])

    const slides = [
      {
        heading: `Title Slide`,
        bullets: [
          title,
          `Subject: ${data.subject} | Class: ${data.level}`,
          'Goal: Understand the concept step by step.'
        ]
      },
      byTitle['Explanation'] && {
        heading: 'Big Idea',
        bullets: Array.isArray(byTitle['Explanation']) ? byTitle['Explanation'] : [String(byTitle['Explanation'])]
      },
      byTitle['Step-by-step'] && {
        heading: 'Steps',
        bullets: byTitle['Step-by-step']
      },
      byTitle['Examples'] && {
        heading: 'Examples',
        bullets: byTitle['Examples']
      },
      keyIdeas.length ? {
        heading: 'Key Points & Tips',
        bullets: keyIdeas
      } : null,
      byTitle['Practice Questions'] && {
        heading: 'Try It Now',
        bullets: byTitle['Practice Questions']
      },
      byTitle['Related Topics'] && {
        heading: 'Connect & Explore',
        bullets: byTitle['Related Topics']
      },
      {
        heading: 'Exit Ticket',
        bullets: [
          'Write 1 thing you learned.',
          'Write 1 question you still have.',
          'Rate your understanding: 😊 | 😐 | 😕'
        ]
      }
    ].filter(Boolean)

    return slides
  }

  const OutlineView = ({ data }) => {
    const slides = buildOutline(data)

    const copyText = () => {
      const text = slides.map((s, i) => `Slide ${i+1}: ${s.heading}\n- ${s.bullets.join('\n- ')}`).join('\n\n')
      navigator.clipboard.writeText(text)
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Presentation Outline</h2>
            <p className="text-sm text-gray-600">Ready-to-present slides with bullet points.</p>
          </div>
          <button onClick={copyText} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded">
            Copy Outline
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {slides.map((s, idx) => (
            <div key={idx} className="rounded-2xl border bg-white shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white bg-indigo-600 px-2 py-1 rounded-full">Slide {idx+1}</span>
                <span className="text-xs text-gray-500">{s.heading}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{s.heading}</h3>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 text-sm">
                {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center">Tip: Paste the copied outline into your slides app and add visuals.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.10),transparent_40%)]">
      <header className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 text-white p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">School Study Assistant</h1>
                <p className="text-white/90 mt-1 max-w-2xl">Clear explanations, step-by-step solutions, examples, practice, and a presentation outline—tailored for Classes 1–10.</p>
              </div>
              <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-3 py-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-white/20">Math</span>
                <span className="px-2 py-1 rounded-full bg-white/20">Science</span>
                <span className="px-2 py-1 rounded-full bg-white/20">English</span>
                <span className="px-2 py-1 rounded-full bg-white/20">Social</span>
                <span className="px-2 py-1 rounded-full bg-white/20">Languages</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-12 -mt-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input type="number" min="1" max="10" value={form.student_class} onChange={e=>setForm(f=>({...f, student_class: Number(e.target.value)}))} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={form.subject} onChange={e=>setForm(f=>({...f, subject: e.target.value}))} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['Math','Science','English','Social Studies','Languages'].map(s=> (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Question or Topic</label>
              <textarea value={form.question} onChange={e=>setForm(f=>({...f, question: e.target.value}))} rows={4} placeholder="e.g., Solve 2x+5=13 or Explain photosynthesis" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Include Sections</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['explanation','steps','examples','practice','summary','tips','fun_facts','related'].map(k => (
                  <label key={k} className="flex items-center gap-2 select-none">
                    <input type="checkbox" checked={form.needs.includes(k)} onChange={() => setForm(f=>{
                      const has = f.needs.includes(k)
                      return { ...f, needs: has ? f.needs.filter(x=>x!==k) : [...f.needs, k] }
                    })} />
                    <span className="capitalize">{k.replace('_',' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={askAssistant} disabled={loading || !form.question.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg shadow">
              {loading ? 'Generating...' : 'Generate Study Guide + Outline'}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          <div className="space-y-4">
            {!result ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-gray-700 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">How it works</h2>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li>Pick your class and subject.</li>
                  <li>Type your topic or question.</li>
                  <li>Get a student-friendly explanation and a ready-to-present outline.</li>
                </ul>
                <div className="mt-4 text-sm text-gray-600">Tip: Be specific (e.g., "Class 7 Algebra: Solve 3(x-2)=9").</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{result.topic}</h2>
                      <p className="text-sm text-gray-600">{result.subject} • Class {result.level}</p>
                    </div>
                    <div className="flex gap-2 text-sm bg-gray-100 rounded-lg p-1">
                      <button onClick={()=>setView('study')} className={`px-3 py-1 rounded-md ${view==='study'?'bg-white shadow font-semibold':'text-gray-600'}`}>Study Guide</button>
                      <button onClick={()=>setView('outline')} className={`px-3 py-1 rounded-md ${view==='outline'?'bg-white shadow font-semibold':'text-gray-600'}`}>Presentation Outline</button>
                    </div>
                  </div>
                </div>

                {view === 'study' ? (
                  <div className="space-y-3">
                    {result.sections?.map((s, idx) => (
                      <Section key={idx} title={s.title} content={s.content} />
                    ))}
                    {result.follow_up && (
                      <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                        <p className="text-sm text-gray-700">{result.follow_up}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <OutlineView data={result} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 py-6">Built for Classes 1–10 • Learn it. Explain it. Share it.</footer>
    </div>
  )
}

export default App
