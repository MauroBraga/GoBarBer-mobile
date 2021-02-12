import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Container,
        Header,
        HeaderTitle,
        BackButtom,
        UserAvatar,
        ProvidersListContainer,
        ProvidersList,
        ProviderContainer,
        ProviderAvatar,
        ProviderName } from './styles';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface RouteParams {
  providerId: string;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const {goBack} = useNavigation();

  const [providers, setProviders] = useState<Provider[]>([]);

  const [selectedProvider, setSelectedProvider] = useState<string>(
    routeParams.providerId,
  );

  useEffect(() =>{
    api.get('providers').then(response =>{
      setProviders(response.data);
    });
  }, []);

  const mavigateBack = useCallback(() => {
    goBack();
  },[goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  return (
    <Container>
      <Header>
        <BackButtom onPress={mavigateBack}>
          <Icon name="chevron-left" size={24} color="#999591"/>
        </BackButtom>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{uri: user.avatar_url}}/>
      </Header>

      <ProvidersListContainer>

        <ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={provider => provider.id}
          renderItem={({item: provider}) =>(
              <ProviderContainer
                  onPress={() => handleSelectProvider(provider.id)}
                  selected={provider.id === selectedProvider}>
                <ProviderAvatar source={{uri: provider.avatar_url}} />
                <ProviderName selected={provider.id === selectedProvider}>{provider.name}</ProviderName>

              </ProviderContainer>
            )}
        />
      </ProvidersListContainer>

    </Container>
  );
};

export default CreateAppointment;
