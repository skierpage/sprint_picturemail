if (typeof document.forms ==='object' && typeof document.forms[0] === 'object') {
  var fes = document.forms[0].elements;
  // iterate through elements
  for (var i = 0; i < fes.length; i++) {
    fe = fes[i];
    if (fe.type === 'hidden') {
      fe.type = 'text';
    }
    // insert a label before.
    var txtNode = document.createTextNode(fe.name); 
    document.forms[0].insertBefore(txtNode, fe);

  }
  // Add a submit button.
  var is = document.createElement("input");
  is.type = 'submit';
  document.forms[0].appendChild(is);
} else {
  document.write('<p>window contents do not appear to be Sprint Picture Mail download form</p>\n');
}
