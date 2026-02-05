# How to Push Changes to GitHub

Follow these steps to save your changes and upload them to GitHub.

## 1. Check Status
First, see which files have been changed.
```powershell
git status
```
*Red files are modified but not staged. Green files are ready to be committed.*

## 2. Stage Changes
Add all your changed files to the "staging area" to prepare them for saving.
```powershell
git add .
```

## 3. Commit Changes
Save your staged changes with a message describing what you did.
```powershell
git commit -m "your message here"
```
*Example:* `git commit -m "fix: update navigation bar colors"`

## 4. Push to GitHub
Upload your saved commits to the server.
```powershell
git push
```

---

## Common Issues

### "Updates were rejected"
If `git push` fails, it usually means there are new changes on GitHub that you don't have yet.
1. Download the new changes:
   ```powershell
   git pull
   ```
2. Then try pushing again:
   ```powershell
   git push
   ```
