---
layout: null
sitemap:
  exclude: 'yes'
---
function setMobileMenu(isOpen) {
  $('.navigation-wrapper')
    .toggleClass('visible', isOpen)
    .toggleClass('animated bounceInDown', isOpen);
  $('.btn-mobile-menu__icon').toggleClass('hidden', isOpen);
  $('.btn-mobile-close__icon').toggleClass('hidden', !isOpen);
  $('.btn-mobile-menu')
    .attr('aria-expanded', isOpen ? 'true' : 'false')
    .attr('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
}

function toggleMobileMenu() {
  setMobileMenu(!$('.navigation-wrapper').hasClass('visible'));
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

function initAvatarCarousel() {
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('.avatar-carousel').each(function () {
    var $carousel = $(this);
    var $slides = $carousel.find('.avatar-carousel__slide');
    var activeIndex = 0;
    var rotationTimer = null;

    if ($slides.length < 2) {
      return;
    }

    function showSlide(index) {
      $slides
        .removeClass('is-active')
        .attr({'aria-hidden': 'true', 'tabindex': '-1'});

      $slides.eq(index)
        .addClass('is-active')
        .removeAttr('aria-hidden')
        .attr('tabindex', '0');

      activeIndex = index;
    }

    function stopRotation() {
      if (rotationTimer) {
        window.clearInterval(rotationTimer);
        rotationTimer = null;
      }
    }

    function startRotation() {
      if (prefersReducedMotion || rotationTimer) {
        return;
      }

      rotationTimer = window.setInterval(function () {
        showSlide((activeIndex + 1) % $slides.length);
      }, 3000);
    }

    showSlide(0);
    startRotation();

    $carousel.on('mouseenter.avatarCarousel focusin.avatarCarousel', stopRotation);
    $carousel.on('resume.avatarCarousel', startRotation);
    $carousel.on('mouseleave.avatarCarousel', function () {
      if (!$carousel.find(':focus').length) {
        startRotation();
      }
    });
    $carousel.on('focusout.avatarCarousel', function () {
      window.setTimeout(function () {
        if (!$carousel.find(':focus').length && !$carousel.is(':hover')) {
          startRotation();
        }
      }, 0);
    });
  });
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
      $(lastTrigger).closest('.avatar-carousel').trigger('resume.avatarCarousel');
      lastTrigger = null;
    }
  }

  $triggers.on('click.imageLightbox', function (event) {
    var $trigger = $(this);
    var $sourceImage = $trigger.find('.avatar-carousel__image').first();

    if (!$sourceImage.length) {
      $sourceImage = $trigger.find('img').first();
    }

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
    toggleMobileMenu();
  });

  var viewportWidth = window.innerWidth;

  $(window).on('resize.mobileMenu', function () {
    var nextViewportWidth = window.innerWidth;

    if (Math.abs(nextViewportWidth - viewportWidth) < 1) {
      return;
    }

    viewportWidth = nextViewportWidth;

    // Browser zoom and device rotation both change the CSS viewport width.
    // Reset an open overlay before the new responsive mode is painted so a
    // mobile menu cannot remain on top of a desktop/tablet composition.
    if ($('.navigation-wrapper').hasClass('visible')) {
      setMobileMenu(false);
    }
  });

  $(document).on('keydown.mobileMenu', function (event) {
    if (event.key === 'Escape' && $('.navigation-wrapper').hasClass('visible')) {
      setMobileMenu(false);
      $('.btn-mobile-menu').trigger('focus');
    }
  });

  initAvatarCarousel();
  initImageLightbox();
});
