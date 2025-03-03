# GitHub Repository Setup Instructions

Follow these steps to create a GitHub repository and push your code:

## 1. Create a Repository on GitHub

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Enter a name for your repository (e.g., "business-expense-tracker")
4. Add an optional description
5. Choose whether the repository should be public or private
6. Do NOT initialize the repository with a README, .gitignore, or license (since you're pushing an existing repository)
7. Click "Create repository"

## 2. Push Your Existing Code to GitHub

After creating the repository, GitHub will show you commands to push an existing repository. Copy the URL of your new repository and run the following commands in your terminal:

```bash
# Add the remote repository URL (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git push -u origin main
```

## 3. Authentication

When pushing to GitHub, you'll need to authenticate. GitHub no longer accepts password authentication for Git operations. Instead, you'll need to use:

1. Personal Access Token (PAT)
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
   - Select the necessary scopes (at minimum, select "repo")
   - Use this token instead of your password when prompted

2. SSH Authentication
   - Set up SSH keys on your machine and add them to your GitHub account
   - Change your remote URL to use SSH: `git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git`

## 4. Verify Your Repository

After pushing, refresh your GitHub repository page to verify that your code has been uploaded successfully.

## 5. Additional Resources

- [GitHub Docs: Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [GitHub Docs: Adding an existing project to GitHub](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-an-existing-project-to-github-using-the-command-line) 