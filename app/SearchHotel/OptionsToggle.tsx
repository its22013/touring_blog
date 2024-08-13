import React from 'react';
import style from './SearchHotel.module.css';

interface OptionsToggleProps {
  showOptions: boolean;
  toggleOptions: () => void;
}

const OptionsToggle: React.FC<OptionsToggleProps> = ({ showOptions, toggleOptions }) => {
  return (
    <div className={style.options_toggle} onClick={toggleOptions}>
      {showOptions ? '▼ 詳細設定を閉じる' : '▶ 詳細設定を表示'}
    </div>
  );
};

export default OptionsToggle;