# GitHub Repository Setup Instructions

Follow these steps to push this project to a private GitHub repository:

## 1. Create a Private Repository on GitHub

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Enter a name for your repository (e.g., "punjabi-ai-podcasts")
4. Add a description (optional)
5. Select "Private" to make the repository private
6. Do NOT initialize the repository with a README, .gitignore, or license
7. Click "Create repository"

## 2. Add the GitHub Repository as a Remote

After creating the repository, GitHub will show you commands to push an existing repository. Run the following command in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/punjabi-ai-podcasts.git
```

Replace `YOUR_USERNAME` with your GitHub username and `punjabi-ai-podcasts` with the name of your repository.

## 3. Push Your Code to GitHub

Push your code to the GitHub repository:

```bash
git push -u origin main
```

You may be prompted to enter your GitHub username and password or a personal access token.

## 4. Verify the Repository

Go to your GitHub account and verify that the repository has been created and the code has been pushed successfully.

## 5. Manage Repository Access

Since this is a private repository, you'll need to explicitly grant access to any collaborators:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Collaborators and teams"
4. Click on "Add people" or "Add teams"
5. Enter the username, full name, or email address of the person you want to add
6. Select the appropriate role (Read, Triage, Write, Maintain, or Admin)
7. Click "Add"

## 6. Set Up Branch Protection (Optional)

To protect your main branch:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Click on "Branches"
4. Under "Branch protection rules", click "Add rule"
5. Enter "main" as the branch name pattern
6. Configure the protection rules as needed
7. Click "Create"

## 7. Set Up GitHub Actions (Optional)

The repository already includes GitHub Actions workflows in the `.github/workflows` directory. These will be automatically detected and used by GitHub Actions.

To view your workflows:

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. You should see your workflows listed there