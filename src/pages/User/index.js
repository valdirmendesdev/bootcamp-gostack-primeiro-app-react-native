import React, {Component} from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  LoadingIndicator,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    await this.loadStarred();
  }

  async loadStarred() {
    const {navigation} = this.props;
    const user = navigation.getParam('user');
    const {stars, page} = this.state;
    this.setState({
      loading: true,
    });
    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });
    this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
      loading: false,
    });
  }

  async refreshList() {
    this.setState({
      page: 1,
      refreshing: true,
    });
    await this.loadStarred();
    this.setState({refreshing: false});
  }

  async handleRepositoryNavigation(repository) {
    const {navigation} = this.props;
    navigation.navigate('Repository', {repository});
  }

  render() {
    const {navigation} = this.props;
    const {stars, loading, refreshing, page} = this.state;

    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading && page === 1 ? (
          <LoadingIndicator color="#7159c1" size="large" />
        ) : (
          <Stars
            onRefresh={() => this.refreshList()}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={() => this.loadStarred()}
            loading={loading}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred onPress={() => this.handleRepositoryNavigation(item)}>
                <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
