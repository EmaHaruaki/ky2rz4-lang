<template>
  <div class="main-container">
    <header class="header">
      <div class="language-switch">
        <nuxt-link :to="switchLocalePath('en')" class="language-link">English</nuxt-link>
        |
        <nuxt-link :to="switchLocalePath('ja')" class="language-link">日本語</nuxt-link>
      </div>
    </header>

    <main class="main">
      <h1 class="title">{{ $t("title") }}<span>β</span></h1>
      <p class="description">{{ $t("description") }}</p>
      <table>
        <tr>
          <td class="language-option">{{ $t("lang.japanese") }} {{ $t("sex.female") }}</td>
          <td><nuxt-link :to="localePath('/talk/ja/female')" class="try-link">{{ $t("try-to-talk") }}</nuxt-link></td>
        </tr>
        <tr>
          <td class="language-option">{{ $t("lang.japanese") }} {{ $t("sex.male") }}</td>
          <td><nuxt-link :to="localePath('/talk/ja/male')" class="try-link">{{ $t("try-to-talk") }}</nuxt-link></td>
        </tr>
        <tr>
          <td class="language-option">{{ $t("lang.english") }} {{ $t("sex.female") }}</td>
          <td><nuxt-link :to="localePath('/talk/en/female')" class="try-link">{{ $t("try-to-talk") }}</nuxt-link></td>
        </tr>
        <tr>
          <td class="language-option">{{ $t("lang.english") }} {{ $t("sex.male") }}</td>
          <td><nuxt-link :to="localePath('/talk/en/male')" class="try-link">{{ $t("try-to-talk") }}</nuxt-link></td>
        </tr>
        
      </table>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <ul>
          <li><nuxt-link :to="localePath('/#')">{{ $t("footer.about") }}</nuxt-link></li>
          <li><nuxt-link :to="localePath('/#')">{{ $t("footer.contact") }}</nuxt-link></li>
          <li><nuxt-link :to="localePath('/#')">{{ $t("footer.privacy-policy") }}</nuxt-link></li>
        </ul>
        <div class="site-copyright">
          <p>Copyright</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
};
</script>
