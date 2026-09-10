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

function initInlinePageNavigation() {
  var isLoadingPage = false;
  var participatesInInlineHistory = Boolean(window.history.state && window.history.state.inlinePage);

  function isModifiedClick(event) {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  }

  function usesCompactLayout() {
    return window.matchMedia && window.matchMedia(
      '(max-width: 639px), (orientation: portrait) and (min-width: 640px) and (max-width: 960px)'
    ).matches;
  }

  function finishReveal($link, $content, $wrapper, delay) {
    window.setTimeout(function () {
      $('body').removeClass('is-page-loading is-inline-page-transition is-inline-page-preparing');
      $('.panel-cover').css({'width': '', 'max-width': ''});
      $wrapper.removeClass('animated slideInRight');
      $link.removeAttr('aria-busy');
      isLoadingPage = false;
      $content.trigger('focus');
    }, delay);
  }

  function focusWithoutScrolling($content) {
    if (!$content.length) {
      return;
    }

    $content[0].focus({preventScroll: true});
  }

  function positionAtContent($content) {
    if (!$content.length) {
      return;
    }

    $content[0].scrollIntoView({behavior: 'auto', block: 'start', inline: 'nearest'});
  }

  function installPage(nextDocument, nextContent, targetUrl, $link, $content, resetScrollPosition) {
    // Stop timers owned by content that is about to leave the document.
    $('.avatar-carousel').trigger('mouseenter.avatarCarousel');

    $content.html(nextContent.innerHTML);
    document.title = nextDocument.title || document.title;

    $('.page-link-button')
      .removeClass('is-active')
      .removeAttr('aria-current');
    $link
      .addClass('is-active')
      .attr('aria-current', 'page');

    if ($('.navigation-wrapper').hasClass('visible')) {
      setMobileMenu(false);
    }

    window.history.pushState(
      {inlinePage: true},
      document.title,
      targetUrl.pathname + targetUrl.search + targetUrl.hash
    );
    participatesInInlineHistory = true;

    if (resetScrollPosition) {
      window.scrollTo(0, 0);
    }

    initAvatarCarousel();
    initImageLightbox();
  }

  function switchContentPage(nextDocument, nextContent, targetUrl, $link, $content, prefersReducedMotion) {
    var $body = $('body');

    function showNextPage() {
      installPage(nextDocument, nextContent, targetUrl, $link, $content, false);
      $body.addClass('is-inline-page');
      positionAtContent($content);

      if (prefersReducedMotion) {
        $body.removeClass('is-page-loading');
        $link.removeAttr('aria-busy');
        isLoadingPage = false;
        focusWithoutScrolling($content);
        return;
      }

      $content.removeClass('is-page-leaving is-page-entering');
      $content[0].offsetWidth;
      $content.addClass('is-page-entering');

      window.setTimeout(function () {
        $content.removeClass('is-page-entering');
        $body.removeClass('is-page-loading is-content-page-transition');
        $link.removeAttr('aria-busy');
        isLoadingPage = false;
        focusWithoutScrolling($content);
      }, 430);
    }

    if (prefersReducedMotion) {
      showNextPage();
      return;
    }

    $body.addClass('is-content-page-transition');
    $content.addClass('is-page-leaving');
    window.setTimeout(showNextPage, 180);
  }

  $('.page-link-button').on('click.inlinePageNavigation', function (event) {
    var $body = $('body');
    var link = this;
    var startedOnHome = $body.hasClass('is-home-page');

    if (isModifiedClick(event) || link.target || !window.fetch || !window.DOMParser) {
      return;
    }

    var targetUrl = new URL(link.href, window.location.href);

    if (targetUrl.origin !== window.location.origin) {
      return;
    }

    if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
      event.preventDefault();

      if ($('.navigation-wrapper').hasClass('visible')) {
        setMobileMenu(false);
      }

      return;
    }

    if (isLoadingPage) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    isLoadingPage = true;

    var $link = $(link);
    var $panel = $('.panel-cover');
    var $wrapper = $('.content-wrapper');
    var $content = $('#main-content');
    var startWidth = $panel[0].getBoundingClientRect().width;
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    $body.addClass('is-page-loading');
    $link.attr('aria-busy', 'true');

    window.fetch(targetUrl.href, {credentials: 'same-origin'})
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load page: ' + response.status);
        }

        return response.text();
      })
      .then(function (html) {
        var nextDocument = new window.DOMParser().parseFromString(html, 'text/html');
        var nextContent = nextDocument.querySelector('#main-content');

        if (!nextContent) {
          throw new Error('The requested page has no main content.');
        }

        if (!startedOnHome) {
          switchContentPage(nextDocument, nextContent, targetUrl, $link, $content, prefersReducedMotion);
          return;
        }

        installPage(nextDocument, nextContent, targetUrl, $link, $content, true);
        $wrapper.addClass('showing');

        if (prefersReducedMotion) {
          $panel.addClass('panel-cover--collapsed');
          $body.removeClass('is-home-page is-page-loading').addClass('is-inline-page');
          $link.removeAttr('aria-busy');
          isLoadingPage = false;
          $content.trigger('focus');
          return;
        }

        if (usesCompactLayout()) {
          $panel.addClass('panel-cover--collapsed');
          $wrapper.addClass('animated slideInRight');
          $body
            .removeClass('is-home-page')
            .addClass('is-inline-page is-inline-page-transition');
          finishReveal($link, $content, $wrapper, 1050);
          return;
        }

        // Match the original theme's desktop reveal: hold the cover at its
        // full width, calculate the responsive rail width, then uncover the
        // content from right to left as the cover contracts.
        $body
          .removeClass('is-home-page')
          .addClass('is-inline-page is-inline-page-transition is-inline-page-preparing');
        $panel.addClass('panel-cover--collapsed');

        var targetWidth = $panel[0].getBoundingClientRect().width;

        $panel.css({'width': startWidth + 'px', 'max-width': 'none'});
        $panel[0].offsetWidth;
        $body.removeClass('is-inline-page-preparing');

        window.requestAnimationFrame(function () {
          $panel.css('width', targetWidth + 'px');
        });

        finishReveal($link, $content, $wrapper, 500);
      })
      .catch(function () {
        window.location.assign(targetUrl.href);
      });
  });

  window.addEventListener('popstate', function (event) {
    if (participatesInInlineHistory || $('body').hasClass('is-inline-page') || (event.state && event.state.inlinePage)) {
      window.location.reload();
    }
  });
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

  $('.image-lightbox').remove();
  $('body').removeClass('image-lightbox-open');
  $(document).off('keydown.imageLightbox');

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

  function clickLandsOnImageContent(event) {
    var image = $image[0];

    if (event.target !== image || !image.naturalWidth || !image.naturalHeight) {
      return false;
    }

    // The <img> fills the dialog while object-fit: contain can leave empty
    // bands around the rendered bitmap. Treat those bands as backdrop too.
    var bounds = image.getBoundingClientRect();
    var sourceRatio = image.naturalWidth / image.naturalHeight;
    var boxRatio = bounds.width / bounds.height;
    var renderedWidth = bounds.width;
    var renderedHeight = bounds.height;

    if (sourceRatio > boxRatio) {
      renderedHeight = renderedWidth / sourceRatio;
    } else {
      renderedWidth = renderedHeight * sourceRatio;
    }

    var renderedLeft = bounds.left + (bounds.width - renderedWidth) / 2;
    var renderedTop = bounds.top + (bounds.height - renderedHeight) / 2;

    return event.clientX >= renderedLeft &&
      event.clientX <= renderedLeft + renderedWidth &&
      event.clientY >= renderedTop &&
      event.clientY <= renderedTop + renderedHeight;
  }

  $lightbox.on('click.imageLightbox', function (event) {
    if ($(event.target).closest('.image-lightbox__close').length || clickLandsOnImageContent(event)) {
      return;
    }

    closeLightbox();
  });

  $(document).on('keydown.imageLightbox', function (event) {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
}

$(document).ready(function () {
  initInlinePageNavigation();

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

  $(document).on('click.mobileMenuDismiss', function (event) {
    if (!$('.navigation-wrapper').hasClass('visible')) {
      return;
    }

    // Clicks on the toggle or inside the open sheet belong to the menu.
    // Any other click is an explicit request to dismiss the overlay.
    if ($(event.target).closest('.btn-mobile-menu, .navigation-wrapper').length) {
      return;
    }

    setMobileMenu(false);
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
