import { useEffect, useState } from 'react'
import { getCurrentUserProfile, getCurrentUserPlaylists, getCurrentUserTopArtists, getCurrentUserTopTracks, getTracksinfo } from '../spotify'
import { SectionWrapper, ArtistGrid, TrackList, PlaylistsGrid, StatGrid } from '../components'

const Profile = () => {
  const [profile, setProfile] = useState(null)
    const [playlists, setPlaylists] = useState(null)
    const [topArtists, setTopArtists] = useState(null)
    const [topTracks, setTopTracks] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getCurrentUserProfile()
            setProfile(userProfile.data)

            const userPlaylists = await getCurrentUserPlaylists()
            setPlaylists(userPlaylists.data)

            const userTopArtists = await getCurrentUserTopArtists()
            setTopArtists(userTopArtists.data)

            const userTopTracks = await getCurrentUserTopTracks()
            setTopTracks(userTopTracks.data)

            const userStats = await showTrack(userTopTracks.data.items)
            setStats(userStats)
        }
    }, [fetchData])

  return (
    <>
      {profile && (
        <>
          <StyledHeader type='user'>
            <div className='header_inner'>
              {profile.images.length && profile.images[0].url && (
                <img className='header_img' src={profile.images[0].url} alt='Avatar'/>
              )}
              <div>
                <div className='header_overline'>Profil</div>
                <h1 className='header_name'>{profile.display_name}</h1>
                <p className='header_meta'>
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
          {topArtists && topTracks && (
            <main>
              <SectionWrapper title='📊 Stats'>
                <StatGrid stats={stats}/>
              </SectionWrapper>

              <SectionWrapper title='🔥 Artistes du mois' seeAllLink='/top-artists'>
                <ArtistGrid artists={topArtists.items.slice(0, 5)}/>
              </SectionWrapper>

              <SectionWrapper title='🔥 Sons du mois' seeAllLink='/top-tracks'>
                <TrackList tracks={topTracks.items.slice(0, 5)}/>
              </SectionWrapper>

              <SectionWrapper title='Playlists' seeAllLink='/playlists'>
                <PlaylistsGrid playlists={playlists.items.slice(0,5)}/>
              </SectionWrapper>
            </main>
          )}
        </>
      )}
    </>
  )
}

export default Profile