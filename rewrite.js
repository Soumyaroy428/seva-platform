const fs = require('fs');

let content = fs.readFileSync('client/src/app/login/page.tsx', 'utf8');

content = content
  .replace(
    /const \[authMethod, setAuthMethod\] = useState<'otp' \| 'password'>\('otp'\);/g,
    "const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('password');"
  )
  .replace(
    /{mode === 'signin' \? 'Sign In via OTP' : 'Create Account via OTP'}/g,
    "{mode === 'signin' ? 'Sign In' : 'Create Account'}"
  )
  .replace(
    />\s*Sign In \(OTP\)\s*</g,
    ">Sign In<"
  );

// Remove the toggle
const toggleStart = content.indexOf('{/* Toggle between OTP and Password method */}');
if (toggleStart !== -1) {
    const toggleEnd = content.indexOf('</div>', toggleStart);
    content = content.substring(0, toggleStart) + content.substring(toggleEnd + 6);
}

// Since authMethod is now password, we must ensure password fallback has the registration fields
// The easiest way is to copy the registration fields into the password fallback flow.
// Actually, let's just use the patched file from earlier but fix it correctly.
// I will just read the original file and do this properly.
