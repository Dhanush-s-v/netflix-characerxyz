import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import ReactPlayer from 'react-player/lazy';
import { FaPlay } from 'react-icons/fa';
import MuiModal from '@mui/material/Modal';
import { modalState, movieState } from '../atoms/modalAtom.';
import {
  CheckIcon,
  PlusIcon,
  ThumbUpIcon,
  VolumeOffIcon,
  VolumeUpIcon,
  XIcon,
} from '@heroicons/react/outline';
import { Element, Genre } from '../typings';

const toastStyle = {
  background: 'white',
  color: 'black',
  fontWeight: 'bold',
  fontSize: '16px',
  padding: '15px',
  borderRadius: '9999px',
  maxWidth: '1000px',
};

function Modal(): JSX.Element {
  const [movie, setMovie] = useRecoilState(movieState);
  const [trailer, setTrailer] = useState('');
  const [showModal, setShowModal] = useRecoilState(modalState);
  const [muted, setMuted] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [addedToList, setAddedToList] = useState(false);

  // Get the movies
  useEffect(() => {
    if (!movie) return;

    async function fetchMovie() {
      const data = await fetch(
        `https://api.themoviedb.org/3/${
          movie?.media_type === 'tv' ? 'tv' : 'movie'
        }/${
          movie?.id
        }?api_key=ffbf77264f014990fb7b418335986e13&language=en-US&append_to_response=videos`
      ).then((response) => response.json());
      if (data?.videos) {
        const index = data.videos.results.findIndex(
          (element: Element) => element.type === 'Trailer'
        );
        setTrailer(data.videos?.results[index]?.key);
      }
      if (data?.genres) {
        setGenres(data.genres);
      }
    }

    fetchMovie();
  }, [movie]);

  // Check if the movie in list
  useEffect(() => {
    // const addedToListMovies = [movie, movie];
    const addedToListMovies = JSON.parse(
      localStorage.getItem('addedToListMovies') as string
    );

    if (!addedToListMovies) {
      setAddedToList(false);
    }

    addedToListMovies?.findIndex(
      (item: { id: number }) => item.id === movie?.id
    ) !== -1;
  }, [addedToList]);

  // Handle the logic: Adding & Removing movies from the list
  const handleList = async () => {
    if (addedToList) {
      const oldMoviesList = JSON.parse(
        localStorage.getItem('addedToListMovies') as string
      );
      const newMoviesList = oldMoviesList.filter(
        (item: { id: number }) => item.id !== movie?.id
      );
      localStorage.setItem('addedToListMovies', JSON.stringify(newMoviesList));
      setAddedToList(!addedToList);

      localStorage.setItem('movies', 'Tom');

      toast(
        `${movie?.title || movie?.original_name} has been removed from My List`,
        {
          duration: 8000,
          style: toastStyle,
        }
      );
    } else {
      const oldMoviesList = JSON.parse(
        localStorage.getItem('addedToListMovies') as string
      );
      const newMoviesList = oldMoviesList ? [...oldMoviesList, movie] : [movie];
      localStorage.setItem('addedToListMovies', JSON.stringify(newMoviesList));
      setAddedToList(!addedToList);

      toast(
        `${movie?.title || movie?.original_name} has been added to My List.`,
        {
          duration: 8000,
          style: toastStyle,
        }
      );
    }
  };

  // Handle close: Movie & Modal & Toast
  const handleClose = () => {
    setShowModal(false);
    setMovie(null);
    toast.dismiss();
  };

  return (
    <MuiModal
      open={showModal}
      onClose={handleClose}
      className="fixed !top-7 left-0 right-0 z-50 mx-auto w-full max-w-5xl overflow-hidden overflow-y-scroll rounded-md scrollbar-hide"
    >
      <>
        <Toaster position="bottom-center" />
        <button
          className="modalButton absolute right-5 top-5 !z-40 h-9 w-9 border-none bg-[#181818] hover:bg-[#181818]"
          onClick={handleClose}
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="relative pt-[56.25%]">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${trailer}`}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: '0', left: '0' }}
            playing
            muted={muted}
          />
          <div className="absolute bottom-10 flex w-full items-center justify-between px-10">
            <div className="flex space-x-2">
              <button className="flex items-center gap-x-2 rounded bg-white px-8 text-xl font-bold text-black transition hover:bg-[#e6e6e6]">
                <FaPlay className="h-7 w-7 text-black" />
                Play
              </button>
              <button className="modalButton" onClick={handleList}>
                {addedToList ? (
                  <CheckIcon className="h-7 w-7" />
                ) : (
                  <PlusIcon className="h-7 w-7" />
                )}
              </button>
              <button className="modalButton">
                <ThumbUpIcon className="h-6 w-6" />
              </button>
            </div>
            <button
              className="modalButton"
              onClick={() => setMuted((muted) => !muted)}
            >
              {muted ? (
                <VolumeOffIcon className="h-6 w-6" />
              ) : (
                <VolumeUpIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        <div className="flex space-x-16 rounded-b-md bg-[#181818] px-10 py-8">
          <div className="space-y-6 text-lg">
            <h1 className="text-3xl font-bold md:text-3xl lg:text-4xl">
              {movie?.title || movie?.name || movie?.original_name}
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <p className="font-semibold text-green-400">
                {movie!.vote_average * 10}% Match
              </p>
              <p className="font-light">
                {movie?.release_date || movie?.first_air_date}
              </p>
              <div className="flex h-4 items-center justify-center rounded border border-white/40 px-1.5 text-xs">
                HD
              </div>
            </div>
            <div className="flex flex-col gap-x-10 gap-y-4 font-light md:flex-row">
              <p className="w-5/6">{movie?.overview}</p>
              <div className="flex flex-col space-y-3 text-sm">
                <div>
                  <span className="text-[gray]">Genres:</span>{' '}
                  {genres.map((genre) => genre.name).join(', ')}
                </div>

                <div>
                  <span className="text-[gray]">Original language:</span>{' '}
                  {movie?.original_language}
                </div>

                <div>
                  <span className="text-[gray]">Total votes:</span>{' '}
                  {movie?.vote_count}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </MuiModal>
  );
}

export default Modal;
