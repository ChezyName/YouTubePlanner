# [YouTube Video Planner](https://chezyname.github.io/YouTubePlanner/)

## How To Plan Your Videos
Once you open the webpage and login to google.
> Google is needed for YouTube API and Google Drive API.
> YouTube API is used to display the user's subscriber count, views, and video count
>Google Drive API is used to hold and store all the files

You can press the ***Create New Video*** Button to create a new video.
![Create New Video Button](https://raw.githubusercontent.com/ChezyName/YouTubePlanner/main/Images/CreateNewVideoButton.png)

Once this button is pressed, you be greated with a new page where you can edit the entire video plan.

![Create New Video Button](https://raw.githubusercontent.com/ChezyName/YouTubePlanner/main/Images/PlannedVideo.png)
 On this page, you can upload and download your thumbnails as well as editing the title, description, and user generated notes.
 
## How This Website Works
On this website, all your data is held by Google / Google Drive. 

```mermaid
flowchart  TD

A[On Page Loaded]  -->B[Login]

B  -->  C[Create New Video]

B  -->  Ca[Delete All Videos]

B  -->  Cab[Open Video]

Cab  -->  Cb[Video Editing Mode]

C  -->  Cb

Ca  -->  B

Cb  -->  D1[Change Thumbnail]

Cb  -->  D2[Download Thumbnail]

Cb  -->  D3[Edit Title]

Cb  -->  D4[Edit Description]

Cb  -->  D5[Edit Notes]

  

D1  -->  E[Save or Discard]

D2  -->  E[Save or Discard]

D3  -->  E[Save or Discard]

D4  -->  E[Save or Discard]

D5  -->  E[Save or Discard]
```

Heres an example of how the page works.