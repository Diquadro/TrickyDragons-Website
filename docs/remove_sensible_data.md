# 🔐 Git History Cleanup Guide (Removing Sensitive Data)

## 🛠️ 1. Clone the repository (optional but recommended)

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

> 🔎 _Cloning into a clean directory helps avoid partial history or leftover refs._

---

## 🚫 2. Remove sensitive files or content from history

```bash
git filter-repo --invert-paths --sensitive-data-removal --path FILE_PATH
```

**Example:**

```bash
git filter-repo --invert-paths --sensitive-data-removal --path .env
```

---

## 🚀 3. Force push the cleaned history to GitHub

```bash
git push --force --all
git push --force --tags
```

> ⚠️ This will rewrite the repository history. Make sure collaborators are aware.

---

## 📄 4. Add the file to `.gitignore` (optional but recommended)

```bash
echo "FILE_PATH" >> .gitignore
git rm --cached FILE_PATH
git add .gitignore
git commit -m "Ignore sensitive file"
git push
```

---

## 🔁 5. Return to your main working repository

```bash
git fetch origin
git reset --hard origin/BRANCH
```

**Example:**

```bash
git reset --hard origin/main
```

> 💡 This ensures your working directory uses the cleaned history.

---

## 🔐 6. Rotate exposed credentials (always!)

If any sensitive data (e.g., passwords, database URIs, API keys) were exposed:

- **Revoke and regenerate** them.
- **Update your `.env` or config files.**
