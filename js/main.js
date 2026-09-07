---
layout: null
sitemap:
  exclude: 'yes'
---
function toggleMobileMenu() {
  var isOpen = !$('.navigation-wrapper').hasClass('visible');

  $('.navigation-wrapper').toggleClass('visible', isOpen);
  $('.btn-mobile-menu__icon').toggleClass('hidden', isOpen);
  $('.btn-mobile-close__icon').toggleClass('hidden', !isOpen);
  $('.btn-mobile-menu')
    .attr('aria-expanded', isOpen ? 'true' : 'false')
    .attr('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
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

function initImageLightbox() {
  var $triggers = $('.image-preview-trigger');

  if (!$triggers.length) {
    return;
  }

  var $lightbox = $(
    '<div class="image-lightbox" aria-hidden="true">' +
      '<div class="image-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image preview">' +
        '<button class="image-lightbox__close" type="button" aria-label="Close image preview">&times;</button>' +
        '<img class="image-lightbox__image" alt="">' +
      '</div>' +
    '</div>'
  ).appendTo('body');
  var $image = $lightbox.find('.image-lightbox__image');
  var $dialog = $lightbox.find('.image-lightbox__dialog');
  var $close = $lightbox.find('.image-lightbox__close');
  var lastTrigger = null;

  function closeLightbox() {
    if (!$lightbox.hasClass('is-open')) {
      return;
    }

    $lightbox.removeClass('is-open').attr('aria-hidden', 'true');
    $('body').removeClass('image-lightbox-open');
    $image.attr('src', '');

    if (lastTrigger) {
      $(lastTrigger).trigger('focus');
      lastTrigger = null;
    }
  }

  $triggers.on('click.imageLightbox', function (event) {
    var $trigger = $(this);
    var $sourceImage = $trigger.find('img');
    var title = $trigger.attr('data-preview-title') || $sourceImage.attr('alt') || 'Image preview';

    event.preventDefault();
    lastTrigger = this;
    $image.attr({
      src: $trigger.attr('href'),
      alt: $sourceImage.attr('alt') || title
    });
    $dialog.attr('aria-label', title);
    $lightbox.addClass('is-open').attr('aria-hidden', 'false');
    $('body').addClass('image-lightbox-open');
    $close.trigger('focus');
  });

  $close.on('click.imageLightbox', function (event) {
    event.preventDefault();
    closeLightbox();
  });

  $lightbox.on('click.imageLightbox', function (event) {
    if (event.target === this) {
      closeLightbox();
    }
  });

  $(document).on('keydown.imageLightbox', function (event) {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
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
  });

  initImageLightbox();
});
