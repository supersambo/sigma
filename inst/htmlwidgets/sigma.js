HTMLWidgets.widget({

  name: "sigma",
  
  type: "output",
  
  initialize: function(el, width, height) {

      
    // create our sigma object and bind it to the element
    var sig = new sigma({
     renderers: [
     {
     container: document.getElementById('sigma'),
     type: 'canvas' // sigma.renderers.canvas works as well
     }
  ]
     });


    // return it as part of our instance data
    return {
      sig: sig
    };




  },
  
  renderValue: function(el, x, instance) {
      
    // parse gexf data
    var parser = new DOMParser();
    var data = parser.parseFromString(x.data, "application/xml");
    
    var selector=[];
    var shifted=false;
    // apply settings
    for (var name in x.settings)
      instance.sig.settings(name, x.settings[name]);
    
    // update the sigma instance
    sigma.parsers.gexf(
      data,          // parsed gexf data
      instance.sig,  // sigma instance we created in initialize
      function(s) {
         // We first need to save the original colors of our
      // nodes and edges, like this:
      s.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
      });
      s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
      });
        // need to call refresh to reflect new settings and data
        instance.sig.refresh();

      }
    );

////////////////////////////////////////////LASSO>///////////////////////////////////////////////////////////////////////////


    initializeGraph = function (sig) {
      sig.refresh();

      var lasso = new sigma.plugins.lasso(sig, sig.renderers[0], {
        'strokeStyle': 'grey',
        'lineWidth': 2,
        'fillWhileDrawing': true,
        'fillStyle': 'rgba(0, 0, 0, 0.1)',
        'cursor': 'crosshair'
      });

        // Listen for selectedNodes event
      lasso.bind('selectedNodes', function (event) {
          // Do something with the selected nodes
       var nodes = event.data;

       // For instance, set all colors to black
       instance.sig.graph.nodes().forEach(function (node) {
         node.color = '#000';
       });

       // Then reset colors of selected nodes and push them to selection array
       nodes.forEach(function (node) {
         node.color = node.originalColor;
         selector.push(node.id);
       });

        sig.refresh();
        console.log('nodes', selector);
        Shiny.onInputChange("selection", selector);
      });

        return lasso;
      };

      firstLasso = initializeGraph(instance.sig);



    // Toggle lasso activation on Alt + l
    document.addEventListener('keyup', function (event) {
      if(event.keyCode==76) {
        if (event.altKey) {
          if (firstLasso.isActive) {
            firstLasso.deactivate();
          } else {
            firstLasso.activate();
          }
        }}
    });



     //empty selector and recolor nodes when doubleclick on stage 
    instance.sig.bind('doubleClickStage', function(e) {
      instance.sig.graph.nodes().forEach(function(n) {
        n.color = n.originalColor;
      });

       //empty selector
      selector= [];
      console.log('nodes',selector);
      Shiny.onInputChange("selection", selector);
      instance.sig.refresh();
    });



////////////////////////////////////////////<LASSO///////////////////////////////////////////////////////////////////////////


    /*//Report clickEvents back to Shiny Server*/
    instance.sig.bind('clickNode', function(e) {
      Shiny.onInputChange("clickNode", e.data.node.id);
    });

    instance.sig.bind('overNode', function(e) {
      Shiny.onInputChange("overNode", e.data.node.label);
    });

  },
  
  resize: function(el, width, height, instance) {
    
    // forward resize on to sigma renderers
    for (var name in instance.sig.renderers)
      instance.sig.renderers[name].resize(width, height);  
  }
});
