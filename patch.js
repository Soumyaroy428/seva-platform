const fs = require('fs');
let content = fs.readFileSync('client/src/app/login/page.tsx', 'utf8');

content = content.replace(/{mode === 'signin' \? 'Sign In via OTP' : 'Create Account via OTP'}/g, "{mode === 'signin' ? 'Sign In' : 'Create Account'}");
content = content.replace(/>\s*Sign In \(OTP\)\s*</g, ">Sign In<");

const startIndex = content.indexOf('{/* ============================================================ */}\n          {/* OTP AUTHENTICATION FLOW */}');
const sectionEndIndex = content.indexOf('{/* Toggle between OTP and Password method */}');

if (startIndex === -1 || sectionEndIndex === -1) {
    console.error('Cannot find boundaries', startIndex, sectionEndIndex);
    process.exit(1);
}

const endOfDivIndex = content.indexOf('</div>', sectionEndIndex);
let endPart = content.indexOf('</div>', endOfDivIndex + 5);

const newForm = `          {/* ============================================================ */}
          {/* PASSWORD AUTHENTICATION FLOW */}
          {/* ============================================================ */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Candidate Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('donor')}
                      className={\`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all \${
                        role === 'donor'
                          ? 'border-orange-500 bg-orange-50/80 text-orange-800 ring-2 ring-orange-400/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }\`}
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Donor</span>
                      <span className="text-[9px] text-slate-400 font-normal">Open</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('volunteer')}
                      className={\`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all \${
                        role === 'volunteer'
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-400/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }\`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Volunteer</span>
                      <span className={\`text-[9px] font-mono \${quotas?.volunteers.isFull ? 'text-rose-600 font-bold' : 'text-slate-400'}\`}>
                        {quotas ? \`\${quotas.volunteers.current}/\${quotas.volunteers.max}\` : '3/4'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={\`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all \${
                        role === 'admin'
                          ? 'border-purple-500 bg-purple-50/80 text-purple-800 ring-2 ring-purple-400/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }\`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Admin</span>
                      <span className={\`text-[9px] font-mono \${quotas?.admins.isFull ? 'text-rose-600 font-bold' : 'text-slate-400'}\`}>
                        {quotas ? \`\${quotas.admins.current}/\${quotas.admins.max}\` : '1/2'}
                      </span>
                    </button>
                  </div>
                </div>

                {role === 'volunteer' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Volunteer Limit ({quotas ? \`\${quotas.volunteers.current}/\${quotas.volunteers.max}\` : '3/4'}):</strong> Strict maximum 4 volunteers permitted. Approvals are vetted by Administrator.
                    </span>
                  </div>
                )}

                {role === 'admin' && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Admin Limit ({quotas ? \`\${quotas.admins.current}/\${quotas.admins.max}\` : '1/2'}):</strong> Maximum 2 platform administrators permitted. Admin gets master CRUD access over all 7 modules.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Candidate Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your legal or preferred name"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {role === 'volunteer' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Operational Area</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="District or zone"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skills</label>
                      <div className="flex flex-wrap gap-1.5">
                        {availableSkillsList.map(sk => (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={\`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-all \${
                              selectedSkills.includes(sk)
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }\`}
                          >
                            {sk}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
`;

content = content.substring(0, startIndex) + newForm + content.substring(endPart + 6);
fs.writeFileSync('client/src/app/login/page.tsx', content);
console.log('patched');
