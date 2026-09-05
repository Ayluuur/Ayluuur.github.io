---
layout: null
sitemap:
  exclude: 'yes'
---
function toggleMobileMenu() {
  $('.navigation-wrapper').toggleClass('visible');
  $('.btn-mobile-menu__icon').toggleClass('hidden');
  $('.btn-mobile-close__icon').toggleClass('hidden');
}

function revealContent() {
  if ($('.content-wrapper').hasClass('showing')) {
    return;
  }

  $('.panel-cover').addClass('panel-cover--collapsed');
  var currentWidth = $('.panel-cover').width();

  if (currentWidth < 960) {
    $('.content-wrapper').addClass('animated slideInRight');
  } else {
    $('.panel-cover').css('max-width', currentWidth);
    $('.panel-cover').animate({'max-width': '530px', 'width': '40%'}, 400, 'swing');
  }

  $('.content-wrapper').addClass('showing');
}

function scrollToSection(hash) {
  var target = $(hash);
  if (!target.length) {
    return;
  }

  window.setTimeout(function () {
    $('html, body').animate({scrollTop: target.offset().top - 20}, 350);
  }, 420);
}

$(document).ready(function () {
  $('a.panel-button').click(function (event) {
    var hash = this.hash;
    if (!hash || !$(hash).length) {
      return;
    }

    event.preventDefault();
    revealContent();
    history.pushState('', document.title, window.location.pathname + window.location.search + hash);
    scrollToSection(hash);

    if ($('.navigation-wrapper').hasClass('visible')) {
      toggleMobileMenu();
    }
  });

  if (window.location.hash === '#about' || window.location.hash === '#portfolio') {
    revealContent();
    scrollToSection(window.location.hash);
  }

  $('.btn-mobile-menu').click(function () {
    if (!$('.navigation-wrapper').hasClass('animated bounceInDown')) {
      $('.navigation-wrapper').addClass('animated bounceInDown');
    }
    toggleMobileMenu();
  }).keydown(function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      $(this).click();
    }
  });
});
