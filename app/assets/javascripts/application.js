'use strict';


$(function(){
  var contacts;
  var contactTemplateSrc =  $("#contact-template").html();
  var contactTemplate = Handlebars.compile(contactTemplateSrc);
  var $contactsTable = $('.js-contacts-table');
  var $favoritesTable = $('.js-favorites-table');
  var $contactForm = $('.js-contact-form');
  var $modal = $('.js-modal');
  var currentContact = null;

  window.getContacts = function() {
    return contacts;
  }

  function fetchContacts() {
    var contactString = localStorage.getItem('addressBookContacts');
    contacts = contactString ? JSON.parse(contactString) : [];
  }

  function storeContacts() {
    var contactString = JSON.stringify(contacts);
    localStorage.setItem('addressBookContacts', contactString);
  }

  function showAllContacts() {
    _.each(contacts, extendContactObject);
  }

  function openModal() {
    $modal.addClass('is-open');
  }

  function closeModal() {
    $modal.removeClass('is-open');
  }

  $('.js-floating-btn').click(function(evt){
    evt.preventDefault();
    currentContact = null;
    openModal();
  });

  $(window).bind('beforeunload', function() {
    storeContacts();
  });

  fetchContacts();
  showAllContacts();

  function extendContactObject(contact) {
    contact.updateView = function(){
      var $currentView, $currentFavView;
      $currentView = this.$view;
      this.$view = $(contactTemplate(this));
      this.bindEventsToView();
      $currentView.replaceWith(this.$view);
      if (this.$favView) {
        $currentFavView = this.$favView;
        this.$favView = this.$view.clone(true);
        $currentFavView.replaceWith(this.$favView);
      }
    };

    contact.updateFavoriteView = function(val){
      if (this.favorite) {
        this.$favView = this.$view.clone(true);
        this.$favView.appendTo($favoritesTable);
      } else if (this.$favView) {
        this.$favView.remove();
        this.$favView = null;
      }
    };

    contact.toggleFavorite = function() {
      this.favorite = !this.favorite;
      this.updateView();
      this.updateFavoriteView();
    }

    contact.remove = function() {
      var index;
      this.$view.remove();
      if (this.$favView) this.$favView.remove();
      index = _.indexOf(contacts, this);
      contacts.splice(index, 1);
    };

    contact.bindEventsToView = function() {
      var favBtn = this.$view.find('.js-favorite');
      var deleteBtn = this.$view.find('.js-delete');
      var updateBtn = this.$view.find('.js-update');
      var _this = this;

      favBtn.click(function(evt) {
        evt.preventDefault();
        _this.toggleFavorite();
      });

      deleteBtn.click(function(evt) {
        evt.preventDefault();
        _this.remove();
      });

      updateBtn.click(function(evt) {
        evt.preventDefault();
        currentContact = _this;
        objectToForm(_this, $contactForm);
        openModal();
      });
    };

    contact.$view = $(contactTemplate(contact));
    contact.bindEventsToView();
    contact.$view.appendTo($contactsTable);
    contact.updateFavoriteView();
  }

  function formToObject($form) {
    var array = $form.serializeArray();
    var object = _(array).reduce(function(obj, field) {
      obj[field.name] = field.value;
      return obj;
    }, {});
    return object;
  }

  function objectToForm(object, $form) {
    for (var key in object) {
      var input = $form.find('[name = "' + key + '"]');
      if (input) input.val(object[key]);
    }
  }

  $contactForm.on('submit', function(evt){
    evt.preventDefault();
    if (!currentContact) {
      var newContact = formToObject($contactForm);
      extendContactObject(newContact);
      contacts.push(newContact);
    } else {
      var newData = formToObject($contactForm);
      for (var key in newData) {
        currentContact[key] = newData[key];
      }
      currentContact.updateView();
      currentContact = null;
    }
    this.reset();
    closeModal();
  });

  $('.js-favorite-current').click(function(evt){
    evt.preventDefault();
    if (currentContact) {
      currentContact.toggleFavorite();
    }
  });

  $('.js-delete-current').click(function(evt){
    evt.preventDefault();
    if (currentContact) {
      currentContact.remove();
      currentContact = null;
      $contactForm[0].reset();
    }
  });

  $('.js-modal-cancel').click(function(evt){
    evt.preventDefault();
    $contactForm[0].reset();
    closeModal();
  });
});
