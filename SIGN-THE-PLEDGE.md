# Sign the pledge

Please follow these steps to add your company to the [pledge page](https://sillysecurityawards.com/pledge) on the Silly Security Awards site.

If you have any trouble, [create a quick issue](https://github.com/sillysecurityawards/awards-site/issues) and we'll be happy to help out!

1. [Edit pledge.html](https://github.com/sillysecurityawards/awards-site/edit/main/pledge.html), and create a fork of the repository when prompted
2. Search for the `EDIT HERE` comment in the template, and add a pledge above that comment by pasting in the following HTML:

```html
<li class="tile">
  <img
    class="tile__logo"
    src="./logos/yourlogo.svg"
    alt="Company logo"
    loading="lazy"
  />
  <p class="tile__name">
    <a href="https://yoursite.com" target="_blank" rel="noopener noreferrer">
      Your Company
    </a>
  </p>
</li>
```

3. Replace 'Your Company' with your company name
4. Replace 'https://yoursite.com' with your company's site
5. Add your company logo to the `logos/` folder in your forked repository, and replace 'yourlogo.svg' with the file name of your logo. The image should ideally be an SVG or PNG around 600px in width
6. [Create a Pull Request](https://github.com/sillysecurityawards/awards-site/compare), and click 'compare across forks'
7. Select your forked repository under 'head repository', and the branch with your changes under 'compare'. Click 'Create pull request' to submit the PR!
8. After submitting your PR, you will be asked to sign a CLA confirming your authority to add your company to the site. Once this is signed, we'll review the PR and get your company added to the site
