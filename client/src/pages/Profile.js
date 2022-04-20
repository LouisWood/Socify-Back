import { useEffect, useState } from 'react';
import { getCurrentUserProfile, getCurrentUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks } from '../scripts/user';
import { getTracksAverageStats } from '../scripts/music';
import { StyledHeader, StyledButton, StyledLogoutButton } from '../styles';
import { SectionWrapper, ArtistGrid, TrackList, PlaylistsGrid, StatGrid } from '../components';
import { catchErrors } from '../utils';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [playlists, setPlaylists] = useState(null);
    const [topArtists, setTopArtists] = useState(null);
    const [topTracks, setTopTracks] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        /**
        * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
        * https://github.com/facebook/react/issues/14326
        */
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile();
            setProfile(userProfile);

            const userPlaylists = await getCurrentUserPlaylists();
            setPlaylists(userPlaylists);

            const userTopArtists = await getCurrentUserTopArtists();
            setTopArtists(userTopArtists);

            const userTopTracks = await getCurrentUserTopTracks();
            setTopTracks(userTopTracks);

            if (userTopTracks) {
                const userStats = await getTracksAverageStats(userTopTracks.items);
                setStats(userStats);
            } else
                setStats(null);
        };
        catchErrors(fetchData());
    }, []);

    return (
        <>
            <StyledButton href="/dashboard">Rooms</StyledButton>
            <StyledLogoutButton href="http://localhost:8000/logout">Se déconnecter</StyledLogoutButton>
            {profile && (
                <>
                    <StyledHeader type="user">
                        <div className="header_inner">
                            {profile.images.length && profile.images[0].url && (
                                <img className="header_img" src={profile.images[0].url} alt="Avatar"/>
                            )}
                            <div>
                                <div className="header_overline">Profil</div>
                                <h1 className="header_name">{profile.display_name}</h1>
                                <p className="header_meta">
                                    {playlists && (
                                        <span>
                                            {playlists.total} Playlist{playlists.total > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    <span>
                                        {profile.followers.total} Ami{profile.followers.total > 1 ? 's' : ''}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </StyledHeader>
                    {
                        topArtists && topTracks && (
                            <main>
                                <SectionWrapper title="📊 Stats">
                                    <StatGrid stats={stats}/>
                                </SectionWrapper>
                                <SectionWrapper title="🔥 Artistes du mois" seeAllLink="/top-artists">
                                    <ArtistGrid artists={topArtists.items.slice(0, 5)}/>
                                </SectionWrapper>

                                <SectionWrapper title="🔥 Sons du mois" seeAllLink="/top-tracks">
                                    <TrackList tracks={topTracks.items.slice(0, 5)}/>
                                </SectionWrapper>

                                <SectionWrapper title="Playlists" seeAllLink="/playlists">
                                    <PlaylistsGrid playlists={playlists.items.slice(0,5)}/>
                                </SectionWrapper>
                            </main>
                        )
                    }
                </>
            )}
        </>
    )
};

export default Profile;