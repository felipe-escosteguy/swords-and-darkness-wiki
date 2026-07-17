<template>
  <div class="custom-home">
    <section class="hero-section">
      <div class="hero-banner-bg"></div>
      <div class="hero-content">
        <div class="hero-title-box">
          <div class="border-top"></div>
          <h1>CORE RULES &amp; WORLD BIBLE</h1>
          <p>The complete guide to the campaign setting.</p>
          <div class="border-bottom"></div>
        </div>
        <div class="hero-buttons">
          <a class="btn-outline" href="/Book I - Core Rules/B01 - Chapter 00 - Introduction">CORE RULES</a>
          <a class="btn-outline" href="/Book II - The Known World/B02 - Chapter 00_ Introduction">THE KNOWN WORLD</a>
        </div>
      </div>
    </section>

    <section class="intro-section">
      <h2>HEROIC FANTASY &amp; GRIM PERIL</h2>
      <h3>A retroclone of the most famous role-playing game’s second edition.</h3>
      
      <div class="intro-text">
        <p>I started writing this game years ago, and I made a promise to myself to make it freely available. Everything you see here is the entire game (although still a work in progress), and you may feel free to play it as you see fit. The system is based on AD&D 2nd Edition, but there are many changes to the mechanics. A guide has been provided at the end of this page to help you use these mechanics with your favorite old-school books.</p>
        
        <p>Sword &amp; Darkness™ is an Open Game License interpretation of Zeb Cook's 2nd Edition rules. All material contained within is free for use, distribution, remix, adaptation, and building upon the material in any medium or format, for noncommercial purposes only, as per the Creative Commons Attribution-NonCommercial 4.0 International license.</p>
      </div>
    </section>

    <section class="books-section">
      <div class="book-card">
        <img src="/cover_1.jpg" alt="Book I - Core Rules">
        <h4>Book I - Core Rules</h4>
        <p>All the necessary rules to create character and run the game</p>
      </div>
      <div class="book-card">
        <img src="/cover_2.jpg" alt="Book II - The Known World">
        <h4>Book II - The Known World</h4>
        <p>Everything about the setting’s nations, people, and locations</p>
      </div>
      <div class="book-card">
        <img src="/cover_3.jpg" alt="Book III - The Darkness">
        <h4>Book III - The Darkness</h4>
        <p>Beasts, monsters, adversaries, and a catalogue of magic items and relics</p>
      </div>
    </section>

    <footer class="custom-footer">
      <div class="footer-divider"></div>
      <p>© 2026 Greyhaven Books | All Rights Reserved</p>
      <img src="/greyhaven-logo.png" alt="Greyhaven Books" class="footer-logo">
    </footer>
  </div>
</template>

<style scoped>
.custom-home {
  display: flex;
  flex-direction: column;
  background-color: #000000;
  color: #ffffff;
  min-height: 100vh;
  margin-top: -64px; /* Offset VitePress navbar height */
}

.hero-section {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 90vh;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@media (max-width: 768px) {
  .hero-section {
    height: auto;
    min-height: 68vh;
    padding: 60px 0 40px;
  }

  .hero-content {
    margin-top: 0;
    padding-top: 20px;
  }

  .hero-title-box {
    min-width: unset;
    width: min(92vw, 560px);
    padding: 24px 20px;
    margin-bottom: 28px;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 16px;
  }
}

.hero-banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/homepage-banner.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.hero-banner-bg::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, transparent, #000000);
}

.hero-banner-bg::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 64px; /* Space for navbar */
}

.hero-title-box {
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding: 30px 60px;
  margin-bottom: 40px;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  min-width: 600px;
}

.hero-title-box h1 {
  font-family: var(--vp-font-family-alt);
  font-size: 38px;
  letter-spacing: 3px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  font-weight: normal;
  color: #fff;
}

.hero-title-box p {
  font-family: var(--vp-font-family-base);
  font-size: 18px;
  margin: 0;
  color: #dddddd;
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.btn-outline {
  font-family: var(--vp-font-family-alt);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #ffffff;
  padding: 12px 35px;
  font-size: 14px;
  letter-spacing: 2px;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
  color: #ffffff;
}

.intro-section {
  padding: 80px 20px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.intro-section h2 {
  font-family: var(--vp-font-family-alt);
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: normal;
  text-transform: uppercase;
  color: #fff;
}

.intro-section h3 {
  font-family: var(--vp-font-family-base);
  font-size: 20px;
  margin-bottom: 60px;
  font-style: italic;
  color: #cccccc;
  font-weight: normal;
}

.intro-text {
  text-align: left;
  font-size: 16px;
  line-height: 1.8;
  color: #dddddd;
  font-family: var(--vp-font-family-base);
}

.intro-text p {
  margin-bottom: 25px;
}

.books-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto 100px auto;
  padding: 0 20px;
}

.book-card {
  text-align: left;
}

.book-card img {
  width: 100%;
  border: 1px solid #444;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  transition: transform 0.3s ease;
}

.book-card:hover img {
  transform: translateY(-5px);
}

.book-card h4 {
  font-family: var(--vp-font-family-alt);
  font-size: 18px;
  margin-bottom: 10px;
  color: #fff;
}

.book-card p {
  font-family: var(--vp-font-family-base);
  font-size: 16px;
  color: #aaaaaa;
  line-height: 1.6;
  margin: 0;
}

.custom-footer {
  text-align: center;
  padding: 40px 20px;
  margin-top: auto;
}

.footer-divider {
  width: 80%;
  max-width: 800px;
  height: 1px;
  background-color: #333;
  margin: 0 auto 40px auto;
}

.custom-footer p {
  font-family: var(--vp-font-family-alt);
  font-size: 12px;
  color: #888;
  margin-bottom: 25px;
  text-transform: uppercase;
}

.footer-logo {
  max-width: 120px;
  margin: 0 auto;
}
</style>
