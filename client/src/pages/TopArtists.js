import { useState, useEffect } from "react";
import { getCurrentUserTopArtists, getCurrentUserProfile } from '../scripts/user';
import { ArtistGrid, SectionWrapper, RangeButton, PlaylistGenButton } from '../components';
import { catchErrors } from '../utils';
import { Link } from 'react-router-dom';
import { StyledButton } from '../styles'

const TopArtists = () => {
    const [topArtists, setTopArtists] = useState(null);
    const [activeRange, setActiveRange] = useState('short');
    const [profile, setProfile] = useState(null);

    useEffect (() => {
         /**
        * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
        * https://github.com/facebook/react/issues/14326
        */
        const fetchData = async () => {
            const artists = await getCurrentUserTopArtists(`${activeRange}_term`);
            setTopArtists(artists);

            const userProfile = await getCurrentUserProfile();
            setProfile(userProfile);
        };
        catchErrors(fetchData());
    }, [activeRange]);

    return (
        <>
            <Link to="/">
                <StyledButton>Home</StyledButton> 
            </Link>
            <main>
                <SectionWrapper title='🚀 Top Artistes' breadcrumb={true}>
                    <RangeButton activeRange={activeRange} setActiveRange={setActiveRange}/>
                    { topArtists && topArtists.items && (<ArtistGrid artists={topArtists.items}/>) }
                </SectionWrapper>
                    {topArtists && topArtists.items && (
                <PlaylistGenButton items={topArtists.items} type={'artists'} profile={profile} range={activeRange}/>)}
            </main>
        </>
        
    );
};

export default TopArtists;