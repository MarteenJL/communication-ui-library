// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import {
  DefaultButton,
  IContextualMenuItem,
  IContextualMenuProps,
  PrimaryButton,
  Stack,
  useTheme
} from '@fluentui/react';

import { _DrawerMenu, _DrawerMenuItemProps } from '@internal/react-components';
import copy from 'copy-to-clipboard';
import { useMemo, useState } from 'react';
/* @conditional-compile-remove(PSTN-calls) */
import { CallWithChatCompositeIcon } from './icons';
import { iconStyles, themedCopyLinkButtonStyles, themedMenuStyle } from './AddPeopleDropdown.styles';
import { CallingDialpad } from './CallingDialpad';
import { CallingDialpadStrings } from './CallingDialpad';
import { _preventDismissOnEvent as preventDismissOnEvent } from '@internal/acs-ui-common';
import { copyLinkButtonContainerStyles, copyLinkButtonStackStyles } from './styles/PeoplePaneContent.styles';
import { drawerContainerStyles } from '../CallComposite/styles/CallComposite.styles';
import { convertContextualMenuItemToDrawerMenuItem } from '../CallWithChatComposite/ConvertContextualMenuItemToDrawerMenuItem';

/** @private */
export interface AddPeopleDropdownStrings extends CallingDialpadStrings {
  copyInviteLinkButtonLabel: string;
  openDialpadButtonLabel: string;
  peoplePaneAddPeopleButtonLabel: string;
}

/** @private */
export interface AddPeopleDropdownProps {
  inviteLink?: string;
  mobileView?: boolean;
  strings: AddPeopleDropdownStrings;
}

/** @private */
export const AddPeopleDropdown = (props: AddPeopleDropdownProps): JSX.Element => {
  const theme = useTheme();

  const { inviteLink, strings, mobileView } = props;

  const [showDialpad, setShowDialpad] = useState(false);

  const menuStyleThemed = useMemo(() => themedMenuStyle(theme), [theme]);

  const copyLinkButtonStylesThemed = useMemo(() => themedCopyLinkButtonStyles(theme, mobileView), [mobileView, theme]);

  const defaultMenuProps = useMemo((): IContextualMenuProps => {
    const menuProps: IContextualMenuProps = {
      styles: menuStyleThemed,
      items: [],
      useTargetWidth: true,
      calloutProps: {
        preventDismissOnEvent
      }
    };

    if (inviteLink) {
      menuProps.items.push({
        key: 'InviteLinkKey',
        text: strings.copyInviteLinkButtonLabel,
        itemProps: { styles: copyLinkButtonStylesThemed },
        iconProps: { iconName: 'Link', style: iconStyles },
        onClick: () => copy(inviteLink)
      });
    }

    menuProps.items.push({
      key: 'DialpadKey',
      text: strings.openDialpadButtonLabel,
      itemProps: { styles: copyLinkButtonStylesThemed },
      iconProps: { iconName: PeoplePaneOpenDialpadIconNameTrampoline(), style: iconStyles },
      onClick: () => setShowDialpad(true),
      'data-ui-id': 'call-with-chat-composite-dial-phone-number-button'
    });

    return menuProps;
  }, [
    strings.copyInviteLinkButtonLabel,
    strings.openDialpadButtonLabel,
    copyLinkButtonStylesThemed,
    inviteLink,
    menuStyleThemed
  ]);

  const onDismissDialpad = (): void => {
    setShowDialpad(false);
  };

  const [addPeopleDrawerMenuItems, setAddPeopleDrawerMenuItems] = useState<_DrawerMenuItemProps[]>([]);

  const setDrawerMenuItemsForAddPeople: () => void = useMemo(() => {
    return () => {
      const drawerMenuItems = defaultMenuProps.items.map((contextualMenu: IContextualMenuItem) =>
        convertContextualMenuItemToDrawerMenuItem(contextualMenu, () => setAddPeopleDrawerMenuItems([]))
      );
      setAddPeopleDrawerMenuItems(drawerMenuItems);
    };
  }, [defaultMenuProps, setAddPeopleDrawerMenuItems]);

  if (mobileView) {
    return (
      <Stack>
        <Stack.Item styles={copyLinkButtonContainerStyles}>
          <PrimaryButton
            onClick={setDrawerMenuItemsForAddPeople}
            styles={copyLinkButtonStylesThemed}
            onRenderIcon={() => PeoplePaneAddPersonIconTrampoline()}
            text={strings.peoplePaneAddPeopleButtonLabel}
            data-ui-id="call-with-chat-composite-add-people-button"
          />
        </Stack.Item>

        {addPeopleDrawerMenuItems.length > 0 && (
          <Stack styles={drawerContainerStyles} data-ui-id="call-with-chat-composite-add-people-dropdown">
            <_DrawerMenu onLightDismiss={() => setAddPeopleDrawerMenuItems([])} items={addPeopleDrawerMenuItems} />
          </Stack>
        )}

        <CallingDialpad isMobile strings={strings} showDialpad={showDialpad} onDismissDialpad={onDismissDialpad} />
      </Stack>
    );
  }

  return (
    <>
      {
        <Stack>
          <CallingDialpad
            isMobile={false}
            strings={strings}
            showDialpad={showDialpad}
            onDismissDialpad={onDismissDialpad}
          />

          <Stack styles={copyLinkButtonStackStyles}>
            <DefaultButton
              onRenderIcon={() => PeoplePaneAddPersonIconTrampoline()}
              text={strings.peoplePaneAddPeopleButtonLabel}
              menuProps={defaultMenuProps}
              styles={copyLinkButtonStylesThemed}
              data-ui-id="call-with-chat-composite-add-people-button"
            />
          </Stack>
        </Stack>
      }
    </>
  );
};

function PeoplePaneOpenDialpadIconNameTrampoline(): string {
  /* @conditional-compile-remove(PSTN-calls) */
  return 'PeoplePaneOpenDialpad';

  return '';
}

function PeoplePaneAddPersonIconTrampoline(): JSX.Element {
  /* @conditional-compile-remove(PSTN-calls) */
  return <CallWithChatCompositeIcon iconName="PeoplePaneAddPerson" />;

  return <></>;
}