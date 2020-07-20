/*
This file holds the JS functions that are used by index.html for hovering on links and cycling images.
*/

// This global variable tracks the currently displayed image. It starts at 7
// so that the first call to displayNextImage() will show image no. 1
// This variable is updated in cycling and when the user hovers ove ran image
var currDisplayID = 7;

// This global variable tracks the output of the setInterval() function. That way
// the interval can be "cleared" when the user hovers over a link
// By clearing the interval, we can stop the execution of the cycling of the images
var interval = null;

/*
This function is used when the user hovers over an image to display a given image.
This should not be confused with displaySampleImage() which is a helper method that
simply displays an image. This method will stop the cycling execution first so that
the slide the user hovers over stays for as long as they hover over the slide.

@param imageID an image ID (1-7)
*/
function displayHoveredImage(imageID) {
  //Stop the image cyclin using the global variable interval
  clearInterval(interval);

  // For now, imageID 4 is rejected because slide 4 isn't implemented
  // We can remove this later!
  if (imageID == 4) {
    return;
  }

  // Use the helper function to now display the selected image
  displaySampleImage(imageID);

  // Now let the user continue to previewing by re-enabling the button
  $("#previewBtnID").prop("disabled", false);
}

/*
 This is a helper function that simply displays the image with a given id from the sample images folder. 
 It is used by displayHoveredImage() and displayNextImage()

 @param imageID an image ID (1-7)
*/
function displaySampleImage(imageID) {
  // Update the image element's source and alternate text attributes using JQUery
  $("#sampleImageID").attr(
    "src",
    "sample_slide_images/sample_slide" + imageID + ".png"
  );
  $("#sampleImageID").attr("alt", "Sample Image for Slide " + imageID);

  // Update the global variable currently displayed image ID.
  // This way, when image cycling starts again, we will start from where the user left off
  // If we didn't do this, cycling would continue from where the cycling stopped!
  currDisplayID = imageID;
}

/*
 This is a helper function that is used by loopSamples() that determines the next
 image to display and then uses displaySampleImage() to display it.
*/
function displayNextImage() {
  // Circular array here, we go back to 1 when we reach the end
  if (currDisplayID == 7) {
    currDisplayID = 1;
  }
  // This case is here until we implement slide 4.
  // when slide 4 is implemented, we can remove this case!
  else if (currDisplayID == 3) {
    currDisplayID = 5;
  }
  // If the index is 1,2,5,6 just increment by 1
  else {
    currDisplayID += 1;
  }

  // Determined next image to display, so we display it
  displaySampleImage(currDisplayID);
}

/*
 This function loops over the sample images using the built in setInterval() method along
 with the helper function displayNextImage(). Images are cycled every 3 seconds.
*/
function loopSamples() {
  $("#previewBtnID").prop("disabled", true);
  interval = setInterval(displayNextImage, 3000);
}
