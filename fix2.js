const fs = require('fs');
let content = fs.readFileSync('client/src/app/login/page.tsx', 'utf8');

// 1. Change default authMethod to password
content = content.replace(/useState<'otp' \| 'password'>\('otp'\)/g, "useState<'otp' | 'password'>('password')");

// 2. Hide toggle by commenting it out (so we don't mess up braces)
const toggleStart = content.indexOf('{/* Toggle between OTP and Password method */}');
const toggleEnd = content.indexOf('</div>', toggleStart);
const toggleBlock = content.substring(toggleStart, toggleEnd + 6);
content = content.substring(0, toggleStart) + '{false && (' + toggleBlock + ')}' + content.substring(toggleEnd + 6);

// 3. Inject the needed registration fields into the password form
const passFormOpen = content.indexOf('<form onSubmit={handlePasswordSubmit}');
const passFormInner = content.indexOf('>', passFormOpen) + 1;

const candStart = content.indexOf('{/* Candidate Role Selector (in register mode) */}');
const candEnd = content.indexOf('{/* Primary Input: Mobile or Email */}');
const candFields = content.substring(candStart, candEnd);

const volStart = content.indexOf('{/* Volunteer extra fields in register mode */}');
const volMatch = content.substring(volStart).match(/<button[\s\S]*?type="submit"[\s\S]*?disabled={loading}/);
const volEnd = volStart + volMatch.index;
const volFields = content.substring(volStart, volEnd);

const phoneInputStr = `
              {mode === 'register' && (
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
              )}
`;

content = content.substring(0, passFormInner) + "\n" + candFields + phoneInputStr + volFields + content.substring(passFormInner);

// 4. Update title
content = content.replace(/{mode === 'signin' \? 'Sign In via OTP' : 'Create Account via OTP'}/g, "{mode === 'signin' ? 'Sign In' : 'Create Account'}");
content = content.replace(/>\s*Sign In \(OTP\)\s*</g, ">Sign In<");

fs.writeFileSync('client/src/app/login/page.tsx', content);
console.log('Done!');
