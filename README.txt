PATH TO VENUS - MOBILE SECTION NAVIGATION FIX

The two files in this folder are replacement versions of the existing
root-level files in the Warren1992/path-to-venus GitHub repository.

CHANGES
* The large mobile header now scrolls out of the way, instead of hiding
  the section when someone taps a navigation link.
* Desktop anchors account for the 72px sticky header.
* Added an actual "About Path to Venus" section for the About link.
* Active navigation highlighting reflects the selected section, instead
  of keeping Home highlighted at the same time.
* Preserved existing site content, design, links, images, and layout.

INSTALL
1. Extract this ZIP.
2. Replace index.html and styles.css in the ROOT of your local
   path-to-venus GitHub repository (NOT the src folder).
3. Commit and push the two file changes to the main branch.
4. Visit https://pathtovenus.com/ and refresh after GitHub Pages redeploys.
5. Test the Home, Mission, Concepts, Videos, Book, About, and Contact links.

NOTE
The connected GitHub tool returned HTTP 403 when attempting to commit
these fixes. They have NOT been deployed automatically. The files in this
package are ready for you to commit from your own GitHub account.
