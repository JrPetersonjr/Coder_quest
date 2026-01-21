// QUICK-START-TESTING.md
// 5-MINUTE VERIFICATION TEST

# ⚡ Quick Start Testing - Verify All Systems Work

## 🎮 5-Minute Verification Test

**Duration:** 5 minutes  
**Goal:** Confirm all core systems are functional

---

## Step 1: Open the Game (30 seconds)

1. Open `index.html` in your browser
2. Wait for boot sequence
3. Should see: `[ TECHNOMANCER: QUEST FOR THE CODE ]`

**✓ Expected Result:** Welcome message displays

---

## Step 2: Test Input Handler (1 minute)

```bash
Type:    help
Method:  Press ENTER key
```

**✓ Expected Result:** 
- Command appears with ">" prefix
- Help text displays

**If this fails:**
1. Open Developer Console (F12)
2. Look for red error messages
3. Check Network tab - all files should be 200 OK

---

## Step 3: Test Send Button (30 seconds)

```bash
Type:    stats
Method:  Click "Send" button
```

**✓ Expected Result:**
- Stats display (HP, MP, Level)
- No errors in console

---

## Step 4: Test Zone Navigation (1 minute)

```bash
Type:    go forest
Press:   ENTER
Wait:    Watch for zone transition animation
```

**✓ Expected Result:**
- Fade animation plays
- Forest description displays
- Zone changed to "forest"

```bash
Type:    go hub
Press:   ENTER
```

**✓ Expected Result:**
- Return to hub zone

---

## Step 5: Test Combat (2 minutes)

```bash
Type:    battle
Press:   ENTER
```

**✓ Expected Result:**
- Battle starts
- Enemy appears

```bash
Type:    attack
Press:   ENTER
Repeat:  2-3 more times until victory
```

**✓ Expected Result:**
- Damage appears on screen
- Victory message shows
- Rewards granted

---

## Step 6: Test Save/Load (30 seconds)

```bash
Type:    save 0
Press:   ENTER
```

**✓ Expected Result:** "Game saved to slot 0"

```bash
Type:    go forest
Press:   ENTER
```

**✓ Expected Result:** Zone changes to forest

```bash
Type:    load 0
Press:   ENTER
```

**✓ Expected Result:** Return to hub (previous save state)

---

## 🎯 Summary

| Test | Pass | Fail |
|------|------|------|
| Help Command | ✅ | ❌ |
| Send Button | ✅ | ❌ |
| Zone Navigation | ✅ | ❌ |
| Combat | ✅ | ❌ |
| Save/Load | ✅ | ❌ |

---

## ✅ If All Tests Pass

**Congratulations!** Game is fully functional.

Next steps:
1. Test in different browsers
2. Run `runIntegrationTests()` in console
3. Complete full playthrough
4. Read PHASE6-QA-GUIDE.md for comprehensive testing

---

## ❌ If Any Test Fails

**Step 1: Check Console**
```
1. Press F12 (DevTools)
2. Go to Console tab
3. Look for red error messages
4. Report the exact error message
```

**Step 2: Common Fixes**

If "Send button not working":
- Refresh page (Ctrl+R)
- Clear browser cache
- Try different browser

If "Commands not submitting":
- Check console for errors
- Verify input field is focused
- Try clicking in input field first

If "Graphics issues":
- Graphics are optional - game works without them
- Check browser supports Canvas (all modern browsers do)

---

## 📞 Reporting Issues

When reporting a bug, include:

1. **What you did:** Exact commands typed
2. **What happened:** Actual result
3. **What should happen:** Expected result
4. **Console errors:** Any red messages (F12)
5. **Browser:** Name and version
6. **OS:** Windows/Mac/Linux and version

---

## 🚀 All Tests Passing?

You're ready for:

1. **Advanced Testing:** See PHASE6-QA-GUIDE.md
2. **Full Playthrough:** 30+ minute test
3. **Browser Compatibility:** Test in 6 browsers
4. **Performance Profiling:** DevTools > Performance
5. **Final Sign-Off:** Ready for release!

---

**Status:** Phase 6 - Active Testing  
**Last Updated:** January 19, 2026  
**Build:** 1.0.0-beta.2
