import os
import re

BASE = "/home/u0_a398/MusicApp/client/src"

def clean_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. AdminPoets.tsx
admin_poets_replacements = [
    ("const eraOptions = ['جاهلي', 'إسلامي', 'أموي', 'عباسي', 'أندلسي', 'مملوكي', 'عثماني', 'حديث', 'معاصر'];\n", ""),
    ("const countryOptions = ['السعودية', 'مصر', 'العراق', 'سوريا', 'الأردن', 'الإمارات', 'الكويت', 'المغرب', 'الجزيرة العربية', 'فارس'];\n\n", ""),
    ("era: string; country: string; birthYear: string; deathYear: string; ", ""),
    ("era: '', country: '', birthYear: '', deathYear: '', ", ""),
    ("const [filterEra, setFilterEra] = useState('الكل');", ""),
    ("if (filterEra !== 'الكل' && p.era !== filterEra) return false;", ""),
    (", filterEra", ""),
    ("era: p.era, country: p.country, birthYear: String(p.birthYear || ''), deathYear: String(p.deathYear || ''),\n      ", ""),
    ("""
    const payload = {
      ...form,
      birthYear: form.birthYear ? parseInt(form.birthYear, 10) : null,
      deathYear: form.deathYear ? parseInt(form.deathYear, 10) : null,
    };""", "    const payload = { ...form };"),
    ("const eras = ['الكل', ...Array.from(new Set(storePoets.map(p => p.era)))];", ""),
    ("""          <div className="flex items-center gap-1 flex-wrap">
            {eras.map(e => (
              <button key={e} onClick={() => setFilterEra(e)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filterEra === e ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}>
                {e}
              </button>
            ))}
          </div>""", ""),
    ("""<th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">العصر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">البلد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الحياة</th>""", ""),
    ("""<td className="px-4 py-3"><span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">{poet.era}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{poet.country}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {poet.birthYear && poet.deathYear ? `${poet.birthYear} - ${poet.deathYear}` : poet.birthYear || '—'}
                  </td>""", ""),
    ("""<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">العصر</label>
                    <select value={form.era} onChange={e => setForm(f => ({ ...f, era: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر العصر</option>
                      {eraOptions.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">البلد</label>
                    <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر البلد</option>
                      {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">سنة الميلاد</label>
                    <input type="number" value={form.birthYear} onChange={e => setForm(f => ({ ...f, birthYear: e.target.value }))}
                      placeholder="مثل: 1923"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">سنة الوفاة</label>
                    <input type="number" value={form.deathYear} onChange={e => setForm(f => ({ ...f, deathYear: e.target.value }))}
                      placeholder="اتركه فارغاً إن كان حياً"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>""", "")
]
clean_file(f"{BASE}/app/pages/admin/AdminPoets.tsx", admin_poets_replacements)

# 2. PoetProfile.tsx
poet_profile_replacements = [
    ("""  const lifeSpan = useMemo(() => {
    if (poet.birthYear && poet.deathYear) {
      return `${poet.birthYear} - ${poet.deathYear}`;
    }
    return poet.birthYear ? `مواليد ${poet.birthYear}` : null;
  }, [poet]);\n""", ""),
    ("""            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              {poet.country && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{poet.country}</span>
                </div>
              )}
              {lifeSpan && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{lifeSpan}</span>
                </div>
              )}
              {poet.era && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full text-sm">
                  <History className="w-4 h-4" />
                  {poet.era}
                </div>
              )}
            </div>""", ""),
]
clean_file(f"{BASE}/app/pages/PoetProfile.tsx", poet_profile_replacements)

# 3. Poets.tsx
poets_replacements = [
    ("  const [selectedEra, setSelectedEra] = useState('الكل');\n", ""),
    ("  const eras = ['الكل', 'جاهلي', 'إسلامي', 'أموي', 'عباسي', 'أندلسي', 'حديث', 'معاصر'];\n", ""),
    ("""  const filteredPoets = selectedEra === 'الكل' 
    ? poets 
    : poets.filter(poet => poet.era === selectedEra);""", "  const filteredPoets = poets;"),
    ("""        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {eras.map((era) => (
            <button
              key={era}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedEra === era
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedEra(era)}
            >
              {era}
            </button>
          ))}
        </div>""", "")
]
clean_file(f"{BASE}/app/pages/Poets.tsx", poets_replacements)

# 4. types/index.ts
# I need to use regex for this
with open(f"{BASE}/app/types/index.ts", 'r', encoding='utf-8') as f:
    types_content = f.read()

types_content = re.sub(r'\s*era\?:\s*string;', '', types_content)
types_content = re.sub(r'\s*country\?:\s*string;', '', types_content)
types_content = re.sub(r'\s*birthYear\?:\s*number;', '', types_content)
types_content = re.sub(r'\s*deathYear\?:\s*number;', '', types_content)

with open(f"{BASE}/app/types/index.ts", 'w', encoding='utf-8') as f:
    f.write(types_content)

print("Poet fields removed successfully.")
