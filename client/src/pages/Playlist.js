import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SectionWrapper, TrackList } from '../components';
import { getPlaylistByID } from '../scripts/music';
import { StyledHeader } from '../styles';
import { catchErrors } from '../utils'

const Playlist = () => {
    //https://reactrouter.com/docs/en/v6/api#useparams
    const {id} = useParams();

    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            const playslist = await getPlaylistByID(id);

            setPlaylist(playslist);
            setTracks(playslist);
            
            if (playslist)
                setTracks(playslist.tracks.items);
        };
        catchErrors(fetchData());
    }, [id])

    const tracksOfTrackList = useMemo(() => {
        if(!tracks)
            return;
        console.log(tracks)
        return tracks.map(({track}) => track);
    }, [tracks])

    console.log(playlist)
    return (
        <>
            {playlist && (
                <>
                    <StyledHeader>
                        <div className='header_inner'>
                            {playlist.images.length && playlist.images[0].url && (
                                <img className='header_img' src={playlist.images[0].url} alt='PP Playlist'/>
                            )}
                            <div>
                                <div className='header_overline'>Playlist</div>
                                <h1 className='header_name'>{playlist.name}</h1>
                                <p className='header_meta'>
                                </p>
                            </div>
                        </div>
                    </StyledHeader>
                    <main>
                        <SectionWrapper title='Playlist' breacrumb={true}>
                            {tracks && (
                                <TrackList tracks={tracksOfTrackList}/>
                            )}
                        </SectionWrapper>
                    </main>
                </>
            )}
        </>
    )
}

export default Playlist;