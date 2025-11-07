(function(){
  var accordions = document.querySelectorAll('.faq-accordion');
  if(!accordions.length) return;

  accordions.forEach(function(acc){
    var items = acc.querySelectorAll('.faq-item');
    items.forEach(function(item, idx){
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if(!btn || !panel) return;

      var controlsId = btn.getAttribute('aria-controls');
      if(!controlsId){
        controlsId = 'faq-panel-' + Math.random().toString(36).slice(2);
        btn.setAttribute('aria-controls', controlsId);
        panel.id = controlsId;
      }

      panel.style.maxHeight = '0';
      btn.setAttribute('aria-expanded','false');

      var setOpen = function(open){
        if(open){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          var inner = panel.firstElementChild;
          var targetHeight = inner ? inner.scrollHeight : panel.scrollHeight;
          panel.style.maxHeight = targetHeight + 'px';
        }else{
          item.classList.remove('open');
          btn.setAttribute('aria-expanded','false');
          panel.style.maxHeight = '0';
        }
      };

      btn.addEventListener('click', function(){
        var currentlyOpen = item.classList.contains('open');
        items.forEach(function(other){
          if(other !== item){
            var otherBtn = other.querySelector('.faq-q');
            var otherPanel = other.querySelector('.faq-a');
            if(otherBtn){
              otherBtn.setAttribute('aria-expanded','false');
            }
            if(otherPanel){
              otherPanel.style.maxHeight = '0';
            }
            other.classList.remove('open');
          }
        });
        setOpen(!currentlyOpen);
      });

      // Allow enter/space keyboard interaction via button semantics (already button)
      // Ensure initial state closed
      setOpen(false);
    });
  });
})();
